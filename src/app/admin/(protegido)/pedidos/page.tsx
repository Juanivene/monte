import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { STATUS_LABELS } from "@/components/admin/OrderStatusBadge";
import type { OrderStatus } from "@prisma/client";

const STATUSES: OrderStatus[] = ["PENDIENTE", "CONFIRMADO", "ENVIADO", "ENTREGADO", "CANCELADO"];

function chipClass(active: boolean) {
  return `inline-flex h-9 shrink-0 items-center rounded-full border px-4 text-sm font-medium whitespace-nowrap ${
    active
      ? "border-neutral-900 bg-neutral-900 text-white"
      : "border-neutral-300 bg-white text-neutral-600 hover:border-neutral-500 active:bg-neutral-100"
  }`;
}

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
      <PageHeader title="Pedidos" />

      {/* En teléfono los filtros se deslizan de costado en vez de apilarse en varias filas. */}
      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        <Link href="/admin/pedidos" scroll={false} className={chipClass(!status)}>
          Todos
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/pedidos?estado=${s}`}
            scroll={false}
            className={chipClass(status === s)}
          >
            {STATUS_LABELS[s]}
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
