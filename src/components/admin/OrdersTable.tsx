import Link from "next/link";
import type { Order } from "@prisma/client";
import { formatPrice } from "@/lib/money";
import { canDeleteOrder } from "@/lib/order-rules";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { PaymentMethodBadge } from "@/components/admin/PaymentMethodBadge";
import { ClickableRow } from "@/components/admin/ClickableRow";
import { DeleteOrderButton } from "@/components/admin/DeleteOrderButton";

function orderLabel(order: Order) {
  return `#${order.id.slice(-8).toUpperCase()}`;
}

function OrderDeleteButton({ order }: { order: Order }) {
  const deletable = canDeleteOrder(order);
  return (
    <DeleteOrderButton
      orderId={order.id}
      orderLabel={orderLabel(order)}
      disabledReason={deletable.ok ? undefined : deletable.reason}
    />
  );
}

/**
 * Tabla de pedidos con dos layouts: tabla real desde `sm` hacia arriba, y
 * lista de tarjetas apiladas por debajo — muestran exactamente los mismos
 * datos, así en mobile no se pierde ninguna columna ni hace falta scrollear
 * horizontalmente para verlas. Toda la fila/tarjeta lleva al detalle.
 */
export function OrdersTable({
  orders,
  showPayment = false,
}: {
  orders: Order[];
  showPayment?: boolean;
}) {
  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-neutral-200 bg-white">
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">Pedido</th>
              <th className="px-4 py-3">Comprador</th>
              <th className="px-4 py-3">Total</th>
              {showPayment && <th className="px-4 py-3">Pago</th>}
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {orders.map((order) => (
              <ClickableRow
                key={order.id}
                href={`/admin/pedidos/${order.id}`}
                className="hover:bg-neutral-50"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/pedidos/${order.id}`}
                    className="font-medium text-neutral-900 hover:underline"
                  >
                    {orderLabel(order)}
                  </Link>
                </td>
                <td className="px-4 py-3">{order.buyerName}</td>
                <td className="px-4 py-3">{formatPrice(order.total)}</td>
                {showPayment && (
                  <td className="px-4 py-3">
                    <PaymentMethodBadge method={order.paymentMethod} />
                  </td>
                )}
                <td className="px-4 py-3">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3 text-neutral-500">
                  {order.createdAt.toLocaleDateString("es-AR")}
                </td>
                <td className="px-4 py-3 text-right">
                  <OrderDeleteButton order={order} />
                </td>
              </ClickableRow>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-neutral-200 sm:hidden">
        {orders.map((order) => (
          <li key={order.id} className="flex items-center gap-2 pr-2 active:bg-neutral-50">
            <Link
              href={`/admin/pedidos/${order.id}`}
              className="block min-w-0 flex-1 py-3.5 pl-4"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="font-medium text-neutral-900">{orderLabel(order)}</span>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="mt-1 truncate text-sm text-neutral-600">{order.buyerName}</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-neutral-900">
                  {formatPrice(order.total)}
                </span>
                {showPayment && <PaymentMethodBadge method={order.paymentMethod} />}
              </div>
              <p className="mt-1.5 text-xs text-neutral-500">
                {order.createdAt.toLocaleDateString("es-AR")}
              </p>
            </Link>
            <OrderDeleteButton order={order} />
          </li>
        ))}
      </ul>
    </div>
  );
}
