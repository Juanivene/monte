import "server-only";
// Envío de emails de pedido (comprador y admin) deshabilitado temporalmente.
// Para reactivar, descomentar estos imports y el cuerpo de sendOrderEmails más abajo.
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- se usa en el bloque comentado
import { resend } from "./resend";
// import OrderConfirmationBuyer from "@/emails/OrderConfirmationBuyer";
// import NewOrderAdmin from "@/emails/NewOrderAdmin";
import type { EmailOrderItem } from "@/emails/shared";

type SendOrderEmailsParams = {
  orderId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  items: EmailOrderItem[];
  total: number;
  shippingSummary: string;
};

export async function sendOrderEmails(params: SendOrderEmailsParams) {
  // ENVÍO DE EMAILS (deshabilitado temporalmente) -- no se envía nada por ahora.
  void params;
  return;

  // const orderShortId = params.orderId.slice(-8).toUpperCase();
  // const from = process.env.EMAIL_FROM;
  // const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;

  // if (!from) {
  //   console.error("Falta EMAIL_FROM: no se enviaron los emails del pedido", orderShortId);
  //   return;
  // }

  // const sends = [
  //   resend.emails.send({
  //     from,
  //     to: params.buyerEmail,
  //     subject: `Recibimos tu pedido #${orderShortId}`,
  //     react: OrderConfirmationBuyer({
  //       buyerName: params.buyerName,
  //       orderShortId,
  //       items: params.items,
  //       total: params.total,
  //       shippingSummary: params.shippingSummary,
  //     }),
  //   }),
  // ];

  // if (adminEmail) {
  //   sends.push(
  //     resend.emails.send({
  //       from,
  //       to: adminEmail,
  //       subject: `Nuevo pedido #${orderShortId} de ${params.buyerName}`,
  //       react: NewOrderAdmin({
  //         orderShortId,
  //         buyerName: params.buyerName,
  //         buyerEmail: params.buyerEmail,
  //         buyerPhone: params.buyerPhone,
  //         items: params.items,
  //         total: params.total,
  //         shippingSummary: params.shippingSummary,
  //       }),
  //     }),
  //   );
  // }

  // const results = await Promise.allSettled(sends);
  // for (const result of results) {
  //   if (result.status === "rejected") {
  //     console.error("Error enviando email de pedido:", result.reason);
  //   }
  // }
}
