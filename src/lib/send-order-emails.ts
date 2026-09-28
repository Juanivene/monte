import "server-only";
import { resend } from "./resend";
import OrderConfirmationBuyer from "@/emails/OrderConfirmationBuyer";
import NewOrderAdmin from "@/emails/NewOrderAdmin";
import OrderStatusUpdate, {
  STATUS_COPY,
  type NotifiableOrderStatus,
} from "@/emails/OrderStatusUpdate";
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
      subject: `Recibimos tu pedido #${orderShortId}`,
      react: OrderConfirmationBuyer({
        buyerName: params.buyerName,
        orderShortId,
        items: params.items,
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
        subject: `Nuevo pedido #${orderShortId} de ${params.buyerName}`,
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
}) {
  if (!Object.hasOwn(STATUS_COPY, params.status)) return;
  const status = params.status as NotifiableOrderStatus;
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
      subject: `${STATUS_COPY[status].subject} #${orderShortId}`,
      react: OrderStatusUpdate({ buyerName: params.buyerName, orderShortId, status }),
    });
    if (error) console.error("Error enviando email de estado del pedido:", error);
  } catch (err) {
    console.error("Error enviando email de estado del pedido:", err);
  }
}
