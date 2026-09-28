import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { OrdersTable } from "@/components/admin/OrdersTable";
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
        <OrdersTable orders={orders} showPayment />
      )}
    </div>
  );
}
