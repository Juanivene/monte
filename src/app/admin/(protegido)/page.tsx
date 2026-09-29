import Link from "next/link";
import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { PageHeader } from "@/components/admin/PageHeader";

// Los estados que piden hacer algo: son los accesos rápidos del inicio.
const PENDING_WORK: { status: OrderStatus; label: string; hint: string; className: string }[] = [
  { status: "PENDIENTE", label: "Pendientes", hint: "Confirmar pago", className: "text-amber-700" },
  { status: "CONFIRMADO", label: "Confirmados", hint: "Para enviar", className: "text-blue-700" },
  { status: "ENVIADO", label: "Enviados", hint: "En camino", className: "text-indigo-700" },
];

export default async function AdminDashboardPage() {
  const [orders, ...counts] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    ...PENDING_WORK.map(({ status }) => prisma.order.count({ where: { status } })),
  ]);

  return (
    <div>
      <PageHeader title="Inicio" />

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {PENDING_WORK.map((item, i) => (
          <Link
            key={item.status}
            href={`/admin/pedidos?estado=${item.status}`}
            className="rounded-xl border border-neutral-200 bg-white p-3 transition-colors hover:border-neutral-400 active:bg-neutral-50 sm:p-4"
          >
            <p className={`text-2xl font-semibold tabular-nums sm:text-3xl ${item.className}`}>
              {counts[i]}
            </p>
            <p className="mt-1 text-sm font-medium text-neutral-900">{item.label}</p>
            <p className="text-xs text-neutral-500">{item.hint}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">Pedidos recientes</h2>
        <Link
          href="/admin/pedidos"
          className="inline-flex min-h-10 items-center text-sm font-medium text-neutral-500 hover:text-neutral-900"
        >
          Ver todos
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">Todavía no hay pedidos.</p>
      ) : (
        <OrdersTable orders={orders} />
      )}
    </div>
  );
}
