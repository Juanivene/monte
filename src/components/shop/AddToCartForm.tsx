"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCart } from "@/lib/cart-context";
import { useI18n } from "@/i18n/client";
import { localePath, pick } from "@/i18n";
import { Button } from "@/components/ui/Button";
import { SIZES, type Size } from "@/types";

/** Ya serializado por el server component: nada de Decimal de Prisma acá. */
export type AddToCartProduct = {
  id: string;
  slug: string;
  name: string;
  nameEn: string | null;
  colorName: string | null;
  colorNameEn: string | null;
  price: number;
  images: { url: string }[];
  variants: { size: Size; stock: number }[];
};

export function AddToCartForm({ product }: { product: AddToCartProduct }) {
  const { addItem } = useCart();
  const { lang, t } = useI18n();
  const router = useRouter();
  const [size, setSize] = useState<Size | null>(null);

  const stockBySize = new Map(product.variants.map((v) => [v.size, v.stock]));
  const hasAnyStock = SIZES.some((s) => (stockBySize.get(s) ?? 0) > 0);
  const selectedStock = size ? (stockBySize.get(size) ?? 0) : 0;

  function handleAdd() {
    if (!size) return;

    // Se guardan los dos idiomas: si el cliente cambia de idioma, el carrito también.
    addItem({
      productId: product.id,
      productName: product.name,
      productNameEn: product.nameEn,
      slug: product.slug,
      image: product.images[0]?.url ?? null,
      colorName: product.colorName,
      colorNameEn: product.colorNameEn,
      price: product.price,
      size,
      quantity: 1,
      maxStock: stockBySize.get(size) ?? 0,
    });

    const name = pick(lang, product.name, product.nameEn);
    const color = pick(lang, product.colorName, product.colorNameEn);
    toast.success(t.addToCart.added, {
      description: `${name}${color ? ` · ${color}` : ""} — ${t.size.withSize(size)}`,
      action: {
        label: t.addToCart.viewCart,
        onClick: () => router.push(localePath(lang, "/carrito")),
      },
    });
  }

  if (!hasAnyStock) {
    return (
      <div className="border-ink/12 border px-5 py-4">
        <p className="eyebrow text-ink">{t.addToCart.soldOutTitle}</p>
        <p className="text-ink-muted mt-2 text-sm">{t.addToCart.soldOutBody}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <p className="eyebrow text-ink-muted">{t.size.label}</p>
        <p className="text-ink-muted text-xs">{t.addToCart.oversize}</p>
      </div>

      <div className="mt-3 grid grid-cols-6 gap-2">
        {SIZES.map((s) => {
          const stock = stockBySize.get(s) ?? 0;
          const disabled = stock <= 0;
          const selected = size === s;

          return (
            <button
              key={s}
              type="button"
              disabled={disabled}
              onClick={() => setSize(s)}
              aria-pressed={selected}
              className={`relative h-12 border text-xs font-medium tracking-wide transition-colors duration-200 ${
                disabled
                  ? "border-ink/10 text-ink-muted/50 cursor-not-allowed"
                  : selected
                    ? "border-ink bg-ink text-bone"
                    : "border-ink/20 text-ink hover:border-ink"
              }`}
            >
              {s}
              {disabled && (
                <span
                  aria-hidden="true"
                  className="bg-ink/15 absolute inset-x-2 top-1/2 h-px -rotate-12"
                />
              )}
            </button>
          );
        })}
      </div>

      <p className="text-ink-muted mt-3 h-4 text-xs">
        {!size
          ? t.addToCart.chooseSize
          : selectedStock <= 3
            ? t.addToCart.unitsLeft(selectedStock, size)
            : t.addToCart.available(size)}
      </p>

      <Button
        type="button"
        onClick={handleAdd}
        disabled={!size}
        size="lg"
        className="mt-5 w-full"
      >
        {t.addToCart.add}
      </Button>
    </div>
  );
}
