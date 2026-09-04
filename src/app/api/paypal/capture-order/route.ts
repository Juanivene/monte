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
    if (capture.status !== "COMPLETED" || capture.capturedAmount !== total) {
      return NextResponse.json({ error: "El pago no se pudo confirmar" }, { status: 400 });
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
