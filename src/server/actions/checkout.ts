"use server";

import { checkoutSchema, type CheckoutInput } from "@/lib/validations";
import { sendOrderEmails } from "@/lib/send-order-emails";
import { buildOrderWhatsAppLink } from "@/lib/whatsapp";
import { computeOrderItems, createOrderRecord } from "@/server/order-service";

export type CheckoutResult =
  | { ok: true; orderId: string; whatsappUrl: string }
  | { ok: false; error: string };

export async function submitCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const data = parsed.data;

  const computed = await computeOrderItems(data.items);
  if (!computed.ok) {
    return { ok: false, error: computed.error };
  }
  const { orderItemsData, total } = computed;

  const order = await createOrderRecord(data, orderItemsData, total, { method: "TRANSFERENCIA" });

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

  const whatsappUrl = buildOrderWhatsAppLink({
    orderId: order.id,
    buyerName: data.buyerName,
    items: emailItems,
    total,
  });

  return { ok: true, orderId: order.id, whatsappUrl };
}
