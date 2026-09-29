import { NextResponse } from "next/server";
import { z } from "zod";
import { checkoutSchema } from "@/lib/validations";
import { sendOrderEmails } from "@/lib/send-order-emails";
import {
  computeOrderItems,
  createOrderRecord,
  shippingSummary,
} from "@/server/order-service";
import { capturePaypalOrder } from "@/lib/paypal";
import { checkoutErrorMessage, getDictionary, hasLocale, type Locale } from "@/i18n";

const bodySchema = checkoutSchema.extend({
  paypalOrderId: z.string().min(1),
});

export async function POST(request: Request): Promise<NextResponse> {
  let lang: Locale = "es";
  try {
    const body = await request.json();
    if (hasLocale(body?.locale)) lang = body.locale;
    const t = getDictionary(lang).errors;

    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: checkoutErrorMessage(lang, parsed.error.issues[0]?.message) },
        { status: 400 },
      );
    }
    const { paypalOrderId, ...data } = parsed.data;

    const computed = await computeOrderItems(data.items, lang);
    if (!computed.ok) {
      return NextResponse.json({ error: computed.error }, { status: 400 });
    }
    const { orderItemsData, buyerItems, total } = computed;

    const capture = await capturePaypalOrder(paypalOrderId);
    if (capture.status !== "COMPLETED") {
      console.error("[paypal] captura no completada", { paypalOrderId, ...capture });
      if (capture.status === "DECLINED") {
        return NextResponse.json({ error: t.paypalDeclined, declined: true }, { status: 402 });
      }
      if (capture.status === "PENDING") {
        return NextResponse.json({ error: t.paypalPending(paypalOrderId) }, { status: 402 });
      }
      return NextResponse.json({ error: t.paypalNotConfirmed }, { status: 400 });
    }
    if (capture.capturedAmount !== total) {
      // Se cobró, pero no el monto esperado: no creamos el pedido y queda logueado.
      console.error("[paypal] monto capturado distinto al total", {
        paypalOrderId,
        capturedAmount: capture.capturedAmount,
        total,
      });
      return NextResponse.json({ error: t.paypalAmount(paypalOrderId) }, { status: 400 });
    }

    const paidAt = new Date();
    const order = await createOrderRecord(data, orderItemsData, total, {
      method: "PAYPAL",
      paypalOrderId,
      paidAt,
    });

    const toEmailItem = (item: (typeof orderItemsData)[number]) => ({
      productName: item.productName,
      colorName: null,
      size: item.size,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    });

    await sendOrderEmails({
      orderId: order.id,
      locale: data.locale,
      buyerName: data.buyerName,
      buyerEmail: data.buyerEmail,
      buyerPhone: data.buyerPhone,
      items: orderItemsData.map(toEmailItem),
      buyerItems: buyerItems.map(toEmailItem),
      total,
      shippingSummary: shippingSummary(data),
    });

    return NextResponse.json({ ok: true, orderId: order.id });
  } catch (error) {
    console.error("[paypal] capture-order", error);
    return NextResponse.json(
      { error: getDictionary(lang).errors.paypalConfirm },
      { status: 400 },
    );
  }
}
