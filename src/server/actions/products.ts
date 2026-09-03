"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { generateUniqueSlug } from "@/lib/unique-slug";
import { productSchema, type ProductInput } from "@/lib/validations";
import type { Size } from "@prisma/client";

export type ActionResult = { ok: true } | { ok: false; error: string };
export type ProductActionResult =
  | { ok: true; productId: string }
  | { ok: false; error: string };

function revalidateShop() {
  revalidatePath("/");
  revalidatePath("/admin/productos");
}

async function slugExists(candidate: string, excludeId?: string) {
  const count = await prisma.product.count({
    where: { slug: candidate, ...(excludeId ? { id: { not: excludeId } } : {}) },
  });
  return count > 0;
}

export async function createProduct(input: ProductInput): Promise<ProductActionResult> {
  await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const data = parsed.data;
  const slug = await generateUniqueSlug(data.name, (c) => slugExists(c));

  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      price: data.price,
      colorName: data.colorName || null,
      categoryId: data.categoryId || null,
      isActive: data.isActive,
      images: { create: data.images.map((url, order) => ({ url, order })) },
      variants: {
        create: data.variants.map((v) => ({ size: v.size as Size, stock: v.stock })),
      },
    },
  });

  revalidateShop();
  return { ok: true, productId: product.id };
}

export async function updateProduct(
  id: string,
  input: ProductInput,
): Promise<ProductActionResult> {
  await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const data = parsed.data;

  const current = await prisma.product.findUnique({ where: { id } });
  if (!current) return { ok: false, error: "Producto no encontrado" };

  const slug =
    current.name === data.name
      ? current.slug
      : await generateUniqueSlug(data.name, (c) => slugExists(c, id));

  await prisma.$transaction([
    prisma.productImage.deleteMany({ where: { productId: id } }),
    prisma.productVariant.deleteMany({ where: { productId: id } }),
    prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        description: data.description,
        price: data.price,
        colorName: data.colorName || null,
        categoryId: data.categoryId || null,
        isActive: data.isActive,
        images: { create: data.images.map((url, order) => ({ url, order })) },
        variants: {
          create: data.variants.map((v) => ({ size: v.size as Size, stock: v.stock })),
        },
      },
    }),
  ]);

  revalidateShop();
  revalidatePath(`/productos/${slug}`);
  return { ok: true, productId: id };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.product.delete({ where: { id } });
  revalidateShop();
  return { ok: true };
}

/**
 * Crea un producto nuevo como "otro color" del producto base: mismo group
 * (se crea uno si el base todavía no tenía), para que se muestren como
 * swatches de color que navegan de un producto a otro.
 */
export async function createColorVariant(
  baseProductId: string,
  input: ProductInput,
): Promise<ProductActionResult> {
  await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const data = parsed.data;

  const base = await prisma.product.findUnique({ where: { id: baseProductId } });
  if (!base) return { ok: false, error: "Producto base no encontrado" };

  let groupId = base.groupId;
  if (!groupId) {
    const group = await prisma.productGroup.create({ data: {} });
    groupId = group.id;
    await prisma.product.update({ where: { id: base.id }, data: { groupId } });
  }

  const slug = await generateUniqueSlug(data.name, (c) => slugExists(c));

  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      price: data.price,
      colorName: data.colorName || null,
      categoryId: data.categoryId || base.categoryId,
      isActive: data.isActive,
      groupId,
      images: { create: data.images.map((url, order) => ({ url, order })) },
      variants: {
        create: data.variants.map((v) => ({ size: v.size as Size, stock: v.stock })),
      },
    },
  });

  revalidateShop();
  return { ok: true, productId: product.id };
}

/**
 * Vincula un producto ya existente como variante de color de otro. Si alguno
 * de los dos ya pertenecía a un grupo con más colores, se fusionan los grupos
 * en vez de perder esos vínculos.
 */
export async function linkAsColorVariant(
  productId: string,
  targetProductId: string,
): Promise<ActionResult> {
  await requireAdmin();
  if (productId === targetProductId) {
    return { ok: false, error: "Elegí un producto distinto" };
  }

  const [product, target] = await Promise.all([
    prisma.product.findUnique({ where: { id: productId } }),
    prisma.product.findUnique({ where: { id: targetProductId } }),
  ]);
  if (!product || !target) return { ok: false, error: "Producto no encontrado" };

  let groupId = target.groupId;
  if (!groupId) {
    const group = await prisma.productGroup.create({ data: {} });
    groupId = group.id;
    await prisma.product.update({ where: { id: target.id }, data: { groupId } });
  }

  if (product.groupId && product.groupId !== groupId) {
    const oldGroupId = product.groupId;
    await prisma.product.updateMany({
      where: { groupId: oldGroupId },
      data: { groupId },
    });
    await prisma.productGroup.delete({ where: { id: oldGroupId } });
  } else {
    await prisma.product.update({ where: { id: product.id }, data: { groupId } });
  }

  revalidateShop();
  return { ok: true };
}

export async function unlinkColorVariant(productId: string): Promise<ActionResult> {
  await requireAdmin();
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product?.groupId) return { ok: true };

  const groupId = product.groupId;
  await prisma.product.update({ where: { id: productId }, data: { groupId: null } });

  const remaining = await prisma.product.count({ where: { groupId } });
  if (remaining === 0) {
    await prisma.productGroup.delete({ where: { id: groupId } });
  }

  revalidateShop();
  return { ok: true };
}
