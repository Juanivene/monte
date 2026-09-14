import { prisma } from "@/lib/prisma";
import { OrdersTable } from "@/components/admin/OrdersTable";

export default async function AdminDashboardPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div>
      <h1 className="text-xl font-semibold text-neutral-900">Pedidos recientes</h1>

      {orders.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">Todavía no hay pedidos.</p>
      ) : (
        <OrdersTable orders={orders} />
      )}
    </div>
  );
}
