"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import type { ActionResult } from "./categories";

/** Guarda el orden de los productos en la tienda: `ids` va en el orden final. */
export async function reorderProducts(ids: string[]): Promise<ActionResult> {
  await requireAdmin();
  await prisma.$transaction(
    ids.map((id, position) => prisma.product.update({ where: { id }, data: { position } })),
  );
  revalidatePath("/[lang]", "layout");
  revalidatePath("/admin/productos/orden");
  return { ok: true };
}
