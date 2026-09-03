import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/money";
import { buildOrderWhatsAppLink } from "@/lib/whatsapp";
import { WhatsAppRedirect } from "@/components/shop/WhatsAppRedirect";

export const dynamic = "force-dynamic";

export default async function OrderReceivedPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) notFound();

  const whatsappUrl = buildOrderWhatsAppLink({
    orderId: order.id,
    buyerName: order.buyerName,
    items: order.items.map((item) => ({
      productName: item.productName,
      colorName: null,
      size: item.size,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
    })),
    total: Number(order.total),
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-neutral-900">¡Gracias, {order.buyerName}!</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Recibimos tu pedido <strong>#{order.id.slice(-8).toUpperCase()}</strong>. Te enviamos un
          email con el resumen.
        </p>
      </div>

      <div className="mt-8 rounded-xl border border-neutral-200 p-5">
        <ul className="divide-y divide-neutral-200">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between py-3 text-sm">
              <span>
                {item.quantity}x {item.productName} — Talle {item.size}
              </span>
              <span className="font-medium">
                {formatPrice(Number(item.unitPrice) * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-center justify-between border-t border-neutral-200 pt-3">
          <span className="text-sm text-neutral-600">Total</span>
          <span className="text-lg font-semibold">{formatPrice(order.total)}</span>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-neutral-50 p-5 text-sm text-neutral-600">
        <p className="font-medium text-neutral-800">Envío a</p>
        <p className="mt-1">
          {order.shippingStreet}, {order.shippingCity}
          {order.shippingState ? `, ${order.shippingState}` : ""}
          {order.shippingPostalCode ? ` (${order.shippingPostalCode})` : ""}, {order.shippingCountry}
        </p>
      </div>

      <WhatsAppRedirect whatsappUrl={whatsappUrl} />
    </div>
  );
}
