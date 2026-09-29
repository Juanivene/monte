import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/money";
import { buildOrderWhatsAppLink } from "@/lib/whatsapp";
import { getDictionary, hasLocale, localePath, pick } from "@/i18n";
import { WhatsAppRedirect } from "@/components/shop/WhatsAppRedirect";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/pedido-recibido/[orderId]">): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: hasLocale(lang) ? getDictionary(lang).meta.orderReceived : undefined,
    robots: { index: false },
  };
}

export default async function OrderReceivedPage({
  params,
}: PageProps<"/[lang]/pedido-recibido/[orderId]">) {
  const { lang, orderId } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: { select: { name: true, nameEn: true, colorName: true, colorNameEn: true } },
        },
      },
    },
  });
  if (!order) notFound();

  // El pedido guarda el nombre en español (para el admin); acá se muestra en el
  // idioma de la página, con ese snapshot como respaldo.
  const items = order.items.map((item) => {
    const name = pick(lang, item.product.name, item.product.nameEn);
    const color = pick(lang, item.product.colorName, item.product.colorNameEn);
    return {
      ...item,
      displayName: lang === "es" ? item.productName : color ? `${name} (${color})` : name,
    };
  });

  const reference = order.id.slice(-8).toUpperCase();
  const isPaidByPaypal = order.paymentMethod === "PAYPAL";

  const whatsappUrl = isPaidByPaypal
    ? null
    : buildOrderWhatsAppLink({
        lang,
        orderId: order.id,
        buyerName: order.buyerName,
        items: items.map((item) => ({
          productName: item.displayName,
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

        <p className="eyebrow text-ink-muted mt-6">{t.order.number(reference)}</p>
        <h1 className="headline mt-4 text-4xl sm:text-5xl">{t.order.thanks(order.buyerName)}</h1>
        <p className="text-ink-soft mx-auto mt-4 max-w-md text-sm leading-relaxed">
          {isPaidByPaypal ? t.order.paidBody : t.order.reservedBody}
        </p>
      </div>

      {whatsappUrl && <WhatsAppRedirect whatsappUrl={whatsappUrl} />}

      <div className="border-ink/12 mt-12 border">
        <p className="eyebrow text-ink-muted border-ink/12 border-b px-5 py-3">
          {t.order.yourOrder}
        </p>
        <ul className="divide-ink/10 divide-y px-5">
          {items.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-4 py-3.5 text-sm">
              <span className="text-ink-soft">
                <span className="text-ink tabular-nums">{item.quantity}×</span>{" "}
                {item.displayName}
                <span className="text-ink-muted"> · {t.size.withSize(item.size)}</span>
              </span>
              <span className="text-ink shrink-0 tabular-nums">
                {formatPrice(Number(item.unitPrice) * item.quantity, lang)}
              </span>
            </li>
          ))}
        </ul>
        <div className="border-ink/12 flex items-baseline justify-between border-t px-5 py-4">
          <span className="eyebrow text-ink">{t.cart.total}</span>
          <span className="headline text-xl tabular-nums">{formatPrice(order.total, lang)}</span>
        </div>
      </div>

      <div className="bg-bone-dark mt-4 px-5 py-5">
        <p className="eyebrow text-ink-muted">{t.order.shipTo}</p>
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
          href={localePath(lang, "/")}
          className="eyebrow text-ink-muted link-underline hover:text-ink transition-colors"
        >
          {t.order.back}
        </Link>
      </div>
    </div>
  );
}
