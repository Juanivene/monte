"use client";

import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useCart } from "@/lib/cart-context";
import { useI18n } from "@/i18n/client";
import { localePath, pick } from "@/i18n";
import { formatPrice } from "@/lib/money";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, itemCount, isHydrated } = useCart();
  const { lang, t } = useI18n();

  if (!isHydrated) {
    return (
      <div className="container-page py-16">
        <div className="skeleton h-10 w-56" />
        <div className="mt-10 space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-28 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-20 sm:py-28">
        <EmptyState
          title={t.cart.emptyTitle}
          description={t.cart.emptyBody}
          action={
            <Link href={localePath(lang, "/")}>
              <Button size="lg">{t.cart.viewCollection}</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="border-ink/12 flex items-end justify-between gap-4 border-b pb-6">
        <h1 className="headline text-4xl sm:text-5xl">{t.cart.title}</h1>
        <p className="eyebrow text-ink-muted tabular-nums">
          {t.catalog.items(itemCount)}
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_20rem] lg:gap-16">
        <ul className="divide-ink/10 divide-y">
          {items.map((item, index) => {
            const name = pick(lang, item.productName, item.productNameEn);
            const color = pick(lang, item.colorName, item.colorNameEn);
            return (
            <li key={`${item.productId}-${item.size}`} className="flex gap-4 py-6 sm:gap-6">
              <Link
                href={localePath(lang, `/productos/${item.slug}`)}
                className="bg-bone-dark relative aspect-3/4 w-20 shrink-0 overflow-hidden sm:w-24"
              >
                {item.image && (
                  <Image
                    src={item.image}
                    alt={name}
                    fill
                    loading={index === 0 ? "eager" : "lazy"}
                    sizes="96px"
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                )}
              </Link>

              <div className="flex flex-1 flex-col justify-between gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={localePath(lang, `/productos/${item.slug}`)}
                      className="link-underline text-ink text-sm font-medium"
                    >
                      {name}
                    </Link>
                    <p className="text-ink-muted mt-1 text-xs">
                      {t.size.withSize(item.size)}
                      {color ? ` · ${color}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      removeItem(item.productId, item.size);
                      toast(t.cart.removed, { description: name });
                    }}
                    aria-label={t.cart.removeLabel(name, item.size)}
                    className="text-ink-muted hover:text-ink shrink-0 text-xs transition-colors"
                  >
                    {t.cart.remove}
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="border-ink/15 flex items-center border">
                    <QuantityButton
                      label={t.cart.decrease}
                      disabled={item.quantity <= 1}
                      onClick={() =>
                        updateQuantity(item.productId, item.size, item.quantity - 1)
                      }
                    >
                      −
                    </QuantityButton>
                    <span className="w-8 text-center text-sm tabular-nums">{item.quantity}</span>
                    <QuantityButton
                      label={t.cart.increase}
                      disabled={item.quantity >= item.maxStock}
                      onClick={() =>
                        updateQuantity(item.productId, item.size, item.quantity + 1)
                      }
                    >
                      +
                    </QuantityButton>
                  </div>

                  <p className="text-ink text-sm tabular-nums">
                    {formatPrice(item.price * item.quantity, lang)}
                  </p>
                </div>
              </div>
            </li>
            );
          })}
        </ul>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="border-ink/12 border p-6">
            <p className="eyebrow text-ink-muted">{t.cart.summary}</p>

            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-muted">{t.cart.subtotal}</dt>
                <dd className="tabular-nums">{formatPrice(subtotal, lang)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-muted">{t.cart.shipping}</dt>
                <dd className="text-ink-muted">{t.cart.shippingTbd}</dd>
              </div>
            </dl>

            <div className="border-ink/12 mt-5 flex items-baseline justify-between border-t pt-5">
              <span className="eyebrow text-ink">{t.cart.total}</span>
              <span className="headline text-xl tabular-nums">{formatPrice(subtotal, lang)}</span>
            </div>

            <Link href={localePath(lang, "/checkout")} className="mt-6 block">
              <Button size="lg" className="w-full">
                {t.cart.checkout}
              </Button>
            </Link>

            <Link
              href={localePath(lang, "/")}
              className="eyebrow text-ink-muted link-underline hover:text-ink mt-5 inline-block transition-colors"
            >
              {t.cart.keepShopping}
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function QuantityButton({
  children,
  label,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="text-ink hover:bg-ink/5 flex h-9 w-9 items-center justify-center text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-25"
    >
      {children}
    </button>
  );
}
