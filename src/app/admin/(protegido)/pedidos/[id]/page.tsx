import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/money";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { PaymentMethodBadge } from "@/components/admin/PaymentMethodBadge";
import { PageHeader } from "@/components/admin/PageHeader";

const cardClass = "rounded-xl border border-neutral-200 bg-white p-4";
const cardTitleClass = "text-xs font-medium tracking-wide text-neutral-500 uppercase";

/** Botón de contacto de un toque (llamar, WhatsApp, mail) para el teléfono. */
function ContactAction({ href, label, external }: { href: string; label: string; external?: boolean }) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="inline-flex min-h-10 flex-1 items-center justify-center rounded-lg border border-neutral-300 px-3 text-sm font-medium text-neutral-800 hover:border-neutral-500 active:bg-neutral-100"
    >
      {label}
    </a>
  );
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();

  const phoneDigits = order.buyerPhone.replace(/\D/g, "").replace(/^00/, "");
  const address = [
    order.shippingStreet,
    order.shippingCity,
    order.shippingState,
    order.shippingPostalCode ? `(${order.shippingPostalCode})` : null,
    order.shippingCountry,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="max-w-3xl">
      <PageHeader
        back={{ href: "/admin/pedidos", label: "Pedidos" }}
        title={`Pedido #${order.id.slice(-8).toUpperCase()}`}
        subtitle={`Hecho el ${order.createdAt.toLocaleString("es-AR", { dateStyle: "medium", timeStyle: "short" })}`}
      />

      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        <div className={`${cardClass} sm:col-span-2`}>
          <h2 className={cardTitleClass}>Estado</h2>
          <div className="mt-2">
            <OrderStatusSelect orderId={order.id} status={order.status} />
          </div>
        </div>

        <div className={cardClass}>
          <h2 className={cardTitleClass}>Comprador</h2>
          <div className="mt-2 space-y-0.5 text-sm text-neutral-700">
            <p className="text-base font-medium text-neutral-900">{order.buyerName}</p>
            <p className="break-all">{order.buyerEmail}</p>
            <p>{order.buyerPhone}</p>
          </div>
          <div className="mt-3 flex gap-2">
            {phoneDigits && <ContactAction href={`tel:${order.buyerPhone}`} label="Llamar" />}
            {phoneDigits && (
              <ContactAction href={`https://wa.me/${phoneDigits}`} label="WhatsApp" external />
            )}
            <ContactAction href={`mailto:${order.buyerEmail}`} label="Mail" />
          </div>
        </div>

        <div className={cardClass}>
          <h2 className={cardTitleClass}>Envío</h2>
          <p className="mt-2 text-sm text-neutral-700">{address}</p>
          {order.shippingNotes && (
            <p className="mt-2 rounded-lg bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
              {order.shippingNotes}
            </p>
          )}
          <div className="mt-3 flex">
            <ContactAction
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
              label="Abrir en Maps"
              external
            />
          </div>
        </div>

        <div className={`${cardClass} sm:col-span-2`}>
          <h2 className={cardTitleClass}>Pago</h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <PaymentMethodBadge method={order.paymentMethod} />
            {order.paidAt && (
              <span className="text-xs text-neutral-500">
                Pagado el {order.paidAt.toLocaleString("es-AR")}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className={`mt-3 sm:mt-4 ${cardClass}`}>
        <h2 className={cardTitleClass}>Productos</h2>
        <ul className="mt-2 divide-y divide-neutral-200">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-3 py-3 text-sm">
              <div className="min-w-0">
                <p className="font-medium text-neutral-900">{item.productName}</p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  Talle {item.size} · {item.quantity} × {formatPrice(Number(item.unitPrice))}
                </p>
              </div>
              <span className="shrink-0 font-medium tabular-nums">
                {formatPrice(Number(item.unitPrice) * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-1 flex items-center justify-between border-t border-neutral-200 pt-3">
          <span className="text-sm text-neutral-600">Total</span>
          <span className="text-lg font-semibold tabular-nums">{formatPrice(order.total)}</span>
        </div>
      </div>
    </div>
  );
}
