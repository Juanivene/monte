import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/money";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/pedidos"
        className="mb-4 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900"
      >
        ← Volver a pedidos
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-neutral-900">
          Pedido #{order.id.slice(-8).toUpperCase()}
        </h1>
        <OrderStatusSelect orderId={order.id} status={order.status} />
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <h2 className="text-sm font-medium text-neutral-900">Comprador</h2>
          <div className="mt-2 space-y-1 text-sm text-neutral-600">
            <p>{order.buyerName}</p>
            <p>{order.buyerEmail}</p>
            <p>{order.buyerPhone}</p>
          </div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <h2 className="text-sm font-medium text-neutral-900">Envío</h2>
          <p className="mt-2 text-sm text-neutral-600">
            {order.shippingStreet}, {order.shippingCity}
            {order.shippingState ? `, ${order.shippingState}` : ""}
            {order.shippingPostalCode ? ` (${order.shippingPostalCode})` : ""}, {order.shippingCountry}
          </p>
          {order.shippingNotes && (
            <p className="mt-2 text-xs text-neutral-500">Notas: {order.shippingNotes}</p>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-4">
        <h2 className="text-sm font-medium text-neutral-900">Productos</h2>
        <ul className="mt-3 divide-y divide-neutral-200">
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
    </div>
  );
}
