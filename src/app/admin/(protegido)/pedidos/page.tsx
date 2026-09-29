import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pagination } from "@/components/admin/Pagination";
import { pageRange, parsePage, redirectIfPageOutOfRange } from "@/lib/pagination";
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
  searchParams: Promise<{ estado?: string; pagina?: string }>;
}) {
  const params = await searchParams;
  const status = STATUSES.find((s) => s === params.estado);
  const page = parsePage(params.pagina);
  const where = status ? { status } : undefined;

  // Solo se trae la página pedida; el id desempata para que el orden sea estable entre páginas.
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      ...pageRange(page),
    }),
    prisma.order.count({ where }),
  ]);

  redirectIfPageOutOfRange(page, total, "/admin/pedidos", params);

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
        <>
          <OrdersTable orders={orders} showPayment />
          <Pagination page={page} total={total} pathname="/admin/pedidos" searchParams={params} />
        </>
      )}
    </div>
  );
}
