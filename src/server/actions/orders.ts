"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { orderStatusSchema } from "@/lib/validations";
import { canDeleteOrder } from "@/lib/order-rules";
import { sendOrderStatusEmail } from "@/lib/send-order-emails";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function updateOrderStatus(
  orderId: string,
  status: string,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = orderStatusSchema.safeParse({ status });
  if (!parsed.success) {
    return { ok: false, error: "Estado inválido" };
  }

  const previous = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true },
  });
  if (!previous) {
    return { ok: false, error: "El pedido ya no existe." };
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status: parsed.data.status },
    select: { id: true, buyerName: true, buyerEmail: true, status: true },
  });

  if (previous.status !== order.status) {
    await sendOrderStatusEmail({
      orderId: order.id,
      buyerName: order.buyerName,
      buyerEmail: order.buyerEmail,
      status: order.status,
    });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${orderId}`);
  return { ok: true };
}

export async function deleteOrder(orderId: string): Promise<ActionResult> {
  await requireAdmin();
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true, paidAt: true },
  });
  if (!order) {
    return { ok: false, error: "El pedido ya no existe." };
  }

  const deletable = canDeleteOrder(order);
  if (!deletable.ok) {
    return { ok: false, error: `No se puede eliminar: ${deletable.reason}` };
  }

  // OrderItem tiene onDelete: Cascade, se van con el pedido.
  await prisma.order.delete({ where: { id: orderId } });

  revalidatePath("/admin");
  revalidatePath("/admin/pedidos");
  return { ok: true };
}
