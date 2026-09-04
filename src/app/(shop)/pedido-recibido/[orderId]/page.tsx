import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/money";
import { buildOrderWhatsAppLink } from "@/lib/whatsapp";
import { WhatsAppRedirect } from "@/components/shop/WhatsAppRedirect";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pedido recibido",
  robots: { index: false },
};

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

  const reference = order.id.slice(-8).toUpperCase();
  const isPaidByPaypal = order.paymentMethod === "PAYPAL";

  const whatsappUrl = isPaidByPaypal
    ? null
    : buildOrderWhatsAppLink({
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
    <div className="container-page max-w-2xl py-16 sm:py-24">
      <div className="text-center">
        <span className="border-ink/15 mx-auto flex h-14 w-14 items-center justify-center rounded-full border">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
            aria-hidden="true"
            className="text-accent-deep h-6 w-6"
          >
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
        </span>

        <p className="eyebrow text-ink-muted mt-6">Pedido #{reference}</p>
        <h1 className="headline mt-4 text-4xl sm:text-5xl">¡Gracias, {order.buyerName}!</h1>
        <p className="text-ink-soft mx-auto mt-4 max-w-md text-sm leading-relaxed">
          {isPaidByPaypal
            ? "Tu pago fue confirmado y te mandamos un mail con el resumen. Ya arrancamos a preparar tu pedido."
            : "Ya tenemos tu pedido reservado y te mandamos un mail con el resumen. Ahora solo falta coordinar el pago y el envío."}
        </p>
      </div>

      {whatsappUrl && <WhatsAppRedirect whatsappUrl={whatsappUrl} />}

      <div className="border-ink/12 mt-12 border">
        <p className="eyebrow text-ink-muted border-ink/12 border-b px-5 py-3">Tu pedido</p>
        <ul className="divide-ink/10 divide-y px-5">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-4 py-3.5 text-sm">
              <span className="text-ink-soft">
                <span className="text-ink tabular-nums">{item.quantity}×</span>{" "}
                {item.productName}
                <span className="text-ink-muted"> · Talle {item.size}</span>
              </span>
              <span className="text-ink shrink-0 tabular-nums">
                {formatPrice(Number(item.unitPrice) * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="border-ink/12 flex items-baseline justify-between border-t px-5 py-4">
          <span className="eyebrow text-ink">Total</span>
          <span className="headline text-xl tabular-nums">{formatPrice(order.total)}</span>
        </div>
      </div>

      <div className="bg-bone-dark mt-4 px-5 py-5">
        <p className="eyebrow text-ink-muted">Envío a</p>
        <p className="text-ink-soft mt-2 text-sm leading-relaxed">
          {order.shippingStreet}, {order.shippingCity}
          {order.shippingState ? `, ${order.shippingState}` : ""}
          {order.shippingPostalCode ? ` (${order.shippingPostalCode})` : ""},{" "}
          {order.shippingCountry}
        </p>
        {order.shippingNotes && (
          <p className="text-ink-muted mt-2 text-xs leading-relaxed">{order.shippingNotes}</p>
        )}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/"
          className="eyebrow text-ink-muted link-underline hover:text-ink transition-colors"
        >
          ← Volver a la tienda
        </Link>
      </div>
    </div>
  );
}
