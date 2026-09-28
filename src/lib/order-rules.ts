import type { OrderStatus } from "@prisma/client";

export type OrderDeletability = { ok: true } | { ok: false; reason: string };

/**
 * Qué pedidos se pueden borrar del admin. Lo usan la tabla (para deshabilitar
 * el botón y explicar por qué) y la server action (que lo vuelve a chequear).
 *
 * - CANCELADO: siempre.
 * - PENDIENTE: solo si no hay un pago registrado (un PayPal ya cobrado es
 *   plata real y el pedido tiene que quedar como registro).
 * - CONFIRMADO / ENVIADO / ENTREGADO: nunca — forman parte del historial de
 *   ventas. Si hace falta sacarlo, primero se cancela.
 */
export function canDeleteOrder(order: {
  status: OrderStatus;
  paidAt: Date | null;
}): OrderDeletability {
  switch (order.status) {
    case "CANCELADO":
      return { ok: true };
    case "PENDIENTE":
      return order.paidAt
        ? { ok: false, reason: "Tiene un pago registrado. Cancelalo primero si querés eliminarlo." }
        : { ok: true };
    case "CONFIRMADO":
      return { ok: false, reason: "Está confirmado. Cancelalo primero si querés eliminarlo." };
    case "ENVIADO":
      return { ok: false, reason: "Ya fue enviado: queda en el historial de ventas." };
    case "ENTREGADO":
      return { ok: false, reason: "Ya fue entregado: queda en el historial de ventas." };
  }
}
