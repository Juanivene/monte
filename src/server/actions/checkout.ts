"use server";

import { prisma } from "@/lib/prisma";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations";
import { sendOrderEmails } from "@/lib/send-order-emails";
import { buildOrderWhatsAppLink } from "@/lib/whatsapp";
import type { Size } from "@prisma/client";

export type CheckoutResult =
  | { ok: true; orderId: string; whatsappUrl: string }
  | { ok: false; error: string };

export async function submitCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const data = parsed.data;

  const productIds = [...new Set(data.items.map((i) => i.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { variants: true },
  });
  const productById = new Map(products.map((p) => [p.id, p]));

  for (const item of data.items) {
    const product = productById.get(item.productId);
    if (!product || !product.isActive) {
      return { ok: false, error: "Uno de los productos ya no está disponible" };
    }
    const variant = product.variants.find((v) => v.size === (item.size as Size));
    if (!variant || variant.stock < item.quantity) {
      return {
        ok: false,
        error: `No hay suficiente stock de "${product.name}" en talle ${item.size}`,
      };
    }
  }

  const orderItemsData = data.items.map((item) => {
    const product = productById.get(item.productId)!;
    return {
      productId: product.id,
      productName: product.colorName ? `${product.name} (${product.colorName})` : product.name,
      size: item.size as Size,
      quantity: item.quantity,
      unitPrice: product.price,
    };
  });

  const total = orderItemsData.reduce(
    (sum, item) => sum + Number(item.unitPrice) * item.quantity,
    0,
  );

  const order = await prisma.order.create({
    data: {
      buyerName: data.buyerName,
      buyerEmail: data.buyerEmail,
      buyerPhone: data.buyerPhone,
      shippingStreet: data.shippingStreet,
      shippingCity: data.shippingCity,
      shippingState: data.shippingState || null,
      shippingPostalCode: data.shippingPostalCode || null,
      shippingCountry: data.shippingCountry,
      shippingNotes: data.shippingNotes || null,
      total,
      items: { create: orderItemsData },
    },
  });

  const shippingSummary = [
    data.shippingStreet,
    data.shippingCity,
    data.shippingState,
    data.shippingPostalCode,
    data.shippingCountry,
  ]
    .filter(Boolean)
    .join(", ");

  const emailItems = orderItemsData.map((item) => ({
    productName: item.productName,
    colorName: null,
    size: item.size,
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice),
  }));

  await sendOrderEmails({
    orderId: order.id,
    buyerName: data.buyerName,
    buyerEmail: data.buyerEmail,
    buyerPhone: data.buyerPhone,
    items: emailItems,
    total,
    shippingSummary,
  });

  const whatsappUrl = buildOrderWhatsAppLink({
    orderId: order.id,
    buyerName: data.buyerName,
    items: emailItems,
    total,
  });

  return { ok: true, orderId: order.id, whatsappUrl };
}
