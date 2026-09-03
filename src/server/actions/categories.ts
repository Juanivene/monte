"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { generateUniqueSlug } from "@/lib/unique-slug";
import { categorySchema, type CategoryInput } from "@/lib/validations";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function createCategory(input: CategoryInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const slug = await generateUniqueSlug(
    parsed.data.name,
    async (candidate) => (await prisma.category.count({ where: { slug: candidate } })) > 0,
  );

  await prisma.category.create({ data: { name: parsed.data.name, slug } });
  revalidatePath("/admin/categorias");
  revalidatePath("/");
  return { ok: true };
}

export async function updateCategory(
  id: string,
  input: CategoryInput,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  await prisma.category.update({
    where: { id },
    data: { name: parsed.data.name },
  });
  revalidatePath("/admin/categorias");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  await requireAdmin();
  // los productos de esta categoría quedan sin categoría (relación opcional, onDelete: SetNull)
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categorias");
  revalidatePath("/");
  return { ok: true };
}
