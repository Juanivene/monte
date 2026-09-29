import { prisma } from "@/lib/prisma";
import type { CheckoutInput } from "@/lib/validations";
import { getDictionary, pick, type Locale } from "@/i18n";
import type { Size, PaymentMethod } from "@prisma/client";

export type OrderItemData = {
  productId: string;
  productName: string;
  size: Size;
  quantity: number;
  unitPrice: number;
};

export type ComputeOrderItemsResult =
  | {
      ok: true;
      /** Snapshot en español: es lo que se guarda y lo que ve el admin. */
      orderItemsData: OrderItemData[];
      /** Los mismos ítems con el nombre en el idioma del comprador (mails, WhatsApp). */
      buyerItems: OrderItemData[];
      total: number;
    }
  | { ok: false; error: string };

function displayName(name: string, colorName: string | null) {
  return colorName ? `${name} (${colorName})` : name;
}

export async function computeOrderItems(
  items: CheckoutInput["items"],
  lang: Locale,
): Promise<ComputeOrderItemsResult> {
  const t = getDictionary(lang);
  const productIds = [...new Set(items.map((i) => i.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { variants: true },
  });
  const productById = new Map(products.map((p) => [p.id, p]));

  for (const item of items) {
    const product = productById.get(item.productId);
    if (!product || !product.isActive) {
      return { ok: false, error: t.errors.productUnavailable };
    }
    const variant = product.variants.find((v) => v.size === (item.size as Size));
    if (!variant || variant.stock < item.quantity) {
      return {
        ok: false,
        error: t.errors.notEnoughStock(pick(lang, product.name, product.nameEn), item.size),
      };
    }
  }

  const orderItemsData: OrderItemData[] = [];
  const buyerItems: OrderItemData[] = [];
  for (const item of items) {
    const product = productById.get(item.productId)!;
    const base = {
      productId: product.id,
      size: item.size as Size,
      quantity: item.quantity,
      unitPrice: Number(product.price),
    };
    orderItemsData.push({ ...base, productName: displayName(product.name, product.colorName) });
    buyerItems.push({
      ...base,
      productName: displayName(
        pick(lang, product.name, product.nameEn),
        pick(lang, product.colorName, product.colorNameEn),
      ),
    });
  }

  const total = orderItemsData.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return { ok: true, orderItemsData, buyerItems, total };
}

export type OrderPayment =
  | { method: "TRANSFERENCIA" }
  | { method: "PAYPAL"; paypalOrderId: string; paidAt: Date };

export async function createOrderRecord(
  data: CheckoutInput,
  orderItemsData: OrderItemData[],
  total: number,
  payment: OrderPayment,
) {
  return prisma.order.create({
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
      locale: data.locale,
      paymentMethod: payment.method as PaymentMethod,
      paypalOrderId: payment.method === "PAYPAL" ? payment.paypalOrderId : null,
      paidAt: payment.method === "PAYPAL" ? payment.paidAt : null,
      items: { create: orderItemsData },
    },
  });
}

/** Dirección de envío en una línea, para los mails. */
export function shippingSummary(data: CheckoutInput): string {
  return [
    data.shippingStreet,
    data.shippingCity,
    data.shippingState,
    data.shippingPostalCode,
    data.shippingCountry,
  ]
    .filter(Boolean)
    .join(", ");
}
