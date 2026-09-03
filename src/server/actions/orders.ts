"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { orderStatusSchema } from "@/lib/validations";

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

  await prisma.order.update({
    where: { id: orderId },
    data: { status: parsed.data.status },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${orderId}`);
  return { ok: true };
}
