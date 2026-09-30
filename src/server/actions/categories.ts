"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { generateUniqueSlug } from "@/lib/unique-slug";
import { categorySchema, type CategoryInput } from "@/lib/validations";

export type ActionResult = { ok: true } | { ok: false; error: string };

function revalidateCategories() {
  revalidatePath("/admin/categorias");
  revalidatePath("/[lang]", "layout");
}

/**
 * Solo hay un nivel de subcategorías: el padre tiene que existir, ser una
 * categoría principal y no ser la propia categoría. Y una categoría que ya
 * tiene subcategorías no puede pasar a ser subcategoría.
 */
async function checkParent(parentId: string, selfId?: string): Promise<string | null> {
  if (parentId === selfId) return "Una categoría no puede ser subcategoría de sí misma";
  const parent = await prisma.category.findUnique({ where: { id: parentId } });
  if (!parent) return "La categoría principal ya no existe";
  if (parent.parentId) return "Una subcategoría no puede tener subcategorías";
  if (selfId && (await prisma.category.count({ where: { parentId: selfId } })) > 0) {
    return "Esta categoría tiene subcategorías, no puede convertirse en una";
  }
  return null;
}

export async function createCategory(input: CategoryInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const parentId = parsed.data.parentId || null;
  if (parentId) {
    const error = await checkParent(parentId);
    if (error) return { ok: false, error };
  }

  const slug = await generateUniqueSlug(
    parsed.data.name,
    async (candidate) => (await prisma.category.count({ where: { slug: candidate } })) > 0,
  );

  await prisma.category.create({
    data: { name: parsed.data.name, nameEn: parsed.data.nameEn || null, slug, parentId },
  });
  revalidateCategories();
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

  const parentId = parsed.data.parentId || null;
  if (parentId) {
    const error = await checkParent(parentId, id);
    if (error) return { ok: false, error };
  }

  await prisma.category.update({
    where: { id },
    data: { name: parsed.data.name, nameEn: parsed.data.nameEn || null, parentId },
  });
  revalidateCategories();
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  await requireAdmin();
  // sus subcategorías se borran en cascada; los productos de la categoría y de
  // sus subcategorías quedan sin categoría (relación opcional, onDelete: SetNull)
  await prisma.category.delete({ where: { id } });
  revalidateCategories();
  return { ok: true };
}
