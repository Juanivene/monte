import { NextResponse } from "next/server";
import { z } from "zod";
import { checkoutSchema } from "@/lib/validations";
import { sendOrderEmails } from "@/lib/send-order-emails";
import { computeOrderItems, createOrderRecord } from "@/server/order-service";
import { capturePaypalOrder } from "@/lib/paypal";

const bodySchema = checkoutSchema.extend({
  paypalOrderId: z.string().min(1),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
        { status: 400 },
      );
    }
    const { paypalOrderId, ...data } = parsed.data;

    const computed = await computeOrderItems(data.items);
    if (!computed.ok) {
      return NextResponse.json({ error: computed.error }, { status: 400 });
    }
    const { orderItemsData, total } = computed;

    const capture = await capturePaypalOrder(paypalOrderId);
    if (capture.status !== "COMPLETED") {
      console.error("[paypal] captura no completada", { paypalOrderId, ...capture });
      if (capture.status === "DECLINED") {
        return NextResponse.json(
          {
            error: "El pago fue rechazado. Probá con otra tarjeta o medio de pago.",
            declined: true,
          },
          { status: 402 },
        );
      }
      if (capture.status === "PENDING") {
        return NextResponse.json(
          {
            error: `PayPal dejó tu pago pendiente de revisión. No vuelvas a pagar: escribinos con este código y lo resolvemos: ${paypalOrderId}`,
          },
          { status: 402 },
        );
      }
      return NextResponse.json({ error: "El pago no se pudo confirmar" }, { status: 400 });
    }
    if (capture.capturedAmount !== total) {
      // Se cobró, pero no el monto esperado: no creamos el pedido y queda logueado.
      console.error("[paypal] monto capturado distinto al total", {
        paypalOrderId,
        capturedAmount: capture.capturedAmount,
        total,
      });
      return NextResponse.json(
        { error: `No pudimos validar el monto del pago. Escribinos con este código: ${paypalOrderId}` },
        { status: 400 },
      );
    }

    const paidAt = new Date();
    const order = await createOrderRecord(data, orderItemsData, total, {
      method: "PAYPAL",
      paypalOrderId,
      paidAt,
    });

    const shippingSummary = [
      data.shippingStreet,
      data.shippingCity,
      data.shippingState,
      data.shippingPostalCode,
      data.shippingCountry,
    ]
      .filter(Boolean)
      .join(", ");

    const emailItems = orderItemsData.map((item) => ({
      productName: item.productName,
      colorName: null,
      size: item.size,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    }));

    await sendOrderEmails({
      orderId: order.id,
      buyerName: data.buyerName,
      buyerEmail: data.buyerEmail,
      buyerPhone: data.buyerPhone,
      items: emailItems,
      total,
      shippingSummary,
    });

    return NextResponse.json({ ok: true, orderId: order.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error confirmando el pago" },
      { status: 400 },
    );
  }
}
