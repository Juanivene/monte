import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/money";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import type { OrderStatus } from "@prisma/client";

const STATUSES: OrderStatus[] = ["PENDIENTE", "CONFIRMADO", "ENVIADO", "ENTREGADO", "CANCELADO"];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const status = STATUSES.find((s) => s === estado);

  const orders = await prisma.order.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-xl font-semibold text-neutral-900">Pedidos</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/admin/pedidos"
          className={`rounded-full border px-3 py-1 text-xs font-medium ${
            !status
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-neutral-300 text-neutral-600 hover:border-neutral-500"
          }`}
        >
          Todos
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/pedidos?estado=${s}`}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              status === s
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-300 text-neutral-600 hover:border-neutral-500"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">No hay pedidos con ese filtro.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3">Pedido</th>
                <th className="px-4 py-3">Comprador</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/pedidos/${order.id}`}
                      className="font-medium text-neutral-900 hover:underline"
                    >
                      #{order.id.slice(-8).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{order.buyerName}</td>
                  <td className="px-4 py-3">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    {order.createdAt.toLocaleDateString("es-AR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
