"use server";

import { checkoutSchema, type CheckoutInput } from "@/lib/validations";
import { sendOrderEmails } from "@/lib/send-order-emails";
import { buildOrderWhatsAppLink } from "@/lib/whatsapp";
import { checkoutErrorMessage, hasLocale } from "@/i18n";
import {
  computeOrderItems,
  createOrderRecord,
  shippingSummary,
} from "@/server/order-service";

export type CheckoutResult =
  | { ok: true; orderId: string; whatsappUrl: string }
  | { ok: false; error: string };

export async function submitCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    const lang = hasLocale(input?.locale) ? input.locale : "es";
    return { ok: false, error: checkoutErrorMessage(lang, parsed.error.issues[0]?.message) };
  }
  const data = parsed.data;

  const computed = await computeOrderItems(data.items, data.locale);
  if (!computed.ok) {
    return { ok: false, error: computed.error };
  }
  const { orderItemsData, buyerItems, total } = computed;

  const order = await createOrderRecord(data, orderItemsData, total, { method: "TRANSFERENCIA" });

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

  const whatsappUrl = buildOrderWhatsAppLink({
    lang: data.locale,
    orderId: order.id,
    buyerName: data.buyerName,
    items: buyerItems.map(toEmailItem),
    total,
  });

  return { ok: true, orderId: order.id, whatsappUrl };
}
