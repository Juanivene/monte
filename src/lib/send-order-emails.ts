import "server-only";
import { resend } from "./resend";
import OrderConfirmationBuyer from "@/emails/OrderConfirmationBuyer";
import NewOrderAdmin from "@/emails/NewOrderAdmin";
import OrderStatusUpdate, { isNotifiableStatus, statusCopy } from "@/emails/OrderStatusUpdate";
import type { EmailOrderItem } from "@/emails/shared";
import { getDictionary, hasLocale, type Locale } from "@/i18n";

type SendOrderEmailsParams = {
  orderId: string;
  /** Idioma del comprador: su mail sale en ese idioma. El del admin, en español. */
  locale: Locale;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  /** Ítems con el nombre en español, para el admin. */
  items: EmailOrderItem[];
  /** Los mismos ítems con el nombre en el idioma del comprador. */
  buyerItems: EmailOrderItem[];
  total: number;
  shippingSummary: string;
};

export async function sendOrderEmails(params: SendOrderEmailsParams) {
  const orderShortId = params.orderId.slice(-8).toUpperCase();
  const from = process.env.EMAIL_FROM;
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;

  if (!from) {
    console.error("Falta EMAIL_FROM: no se enviaron los emails del pedido", orderShortId);
    return;
  }

  const sends = [
    resend.emails.send({
      from,
      to: params.buyerEmail,
      subject: getDictionary(params.locale).emails.confirmationSubject(orderShortId),
      react: OrderConfirmationBuyer({
        lang: params.locale,
        buyerName: params.buyerName,
        orderShortId,
        items: params.buyerItems,
        total: params.total,
        shippingSummary: params.shippingSummary,
      }),
    }),
  ];

  if (adminEmail) {
    sends.push(
      resend.emails.send({
        from,
        to: adminEmail,
        subject: `Nuevo pedido #${orderShortId} de ${params.buyerName}${
          params.locale === "en" ? " (en inglés)" : ""
        }`,
        react: NewOrderAdmin({
          orderShortId,
          buyerName: params.buyerName,
          buyerEmail: params.buyerEmail,
          buyerPhone: params.buyerPhone,
          items: params.items,
          total: params.total,
          shippingSummary: params.shippingSummary,
        }),
      }),
    );
  }

  const results = await Promise.allSettled(sends);
  for (const result of results) {
    if (result.status === "rejected") {
      console.error("Error enviando email de pedido:", result.reason);
    } else if (result.value.error) {
      console.error("Error enviando email de pedido:", result.value.error);
    }
  }
}

export async function sendOrderStatusEmail(params: {
  orderId: string;
  buyerName: string;
  buyerEmail: string;
  status: string;
  /** Idioma en que se hizo el pedido (Order.locale). */
  locale: string;
}) {
  if (!isNotifiableStatus(params.status)) return;
  const status = params.status;
  const lang: Locale = hasLocale(params.locale) ? params.locale : "es";
  const orderShortId = params.orderId.slice(-8).toUpperCase();
  const from = process.env.EMAIL_FROM;

  if (!from) {
    console.error("Falta EMAIL_FROM: no se envió el email de estado del pedido", orderShortId);
    return;
  }

  try {
    const { error } = await resend.emails.send({
      from,
      to: params.buyerEmail,
      subject: `${statusCopy(lang, status).subject} #${orderShortId}`,
      react: OrderStatusUpdate({ lang, buyerName: params.buyerName, orderShortId, status }),
    });
    if (error) console.error("Error enviando email de estado del pedido:", error);
  } catch (err) {
    console.error("Error enviando email de estado del pedido:", err);
  }
}
