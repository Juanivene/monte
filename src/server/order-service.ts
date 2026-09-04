import { prisma } from "@/lib/prisma";
import type { CheckoutInput } from "@/lib/validations";
import type { Size, PaymentMethod } from "@prisma/client";

export type OrderItemData = {
  productId: string;
  productName: string;
  size: Size;
  quantity: number;
  unitPrice: number;
};

export type ComputeOrderItemsResult =
  | { ok: true; orderItemsData: OrderItemData[]; total: number }
  | { ok: false; error: string };

export async function computeOrderItems(
  items: CheckoutInput["items"],
): Promise<ComputeOrderItemsResult> {
  const productIds = [...new Set(items.map((i) => i.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { variants: true },
  });
  const productById = new Map(products.map((p) => [p.id, p]));

  for (const item of items) {
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

  const orderItemsData = items.map((item) => {
    const product = productById.get(item.productId)!;
    return {
      productId: product.id,
      productName: product.colorName ? `${product.name} (${product.colorName})` : product.name,
      size: item.size as Size,
      quantity: item.quantity,
      unitPrice: Number(product.price),
    };
  });

  const total = orderItemsData.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return { ok: true, orderItemsData, total };
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
      paymentMethod: payment.method as PaymentMethod,
      paypalOrderId: payment.method === "PAYPAL" ? payment.paypalOrderId : null,
      paidAt: payment.method === "PAYPAL" ? payment.paidAt : null,
      items: { create: orderItemsData },
    },
  });
}
