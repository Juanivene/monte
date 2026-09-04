"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/Button";
import { SIZES, type Size } from "@/types";

/** Ya serializado por el server component: nada de Decimal de Prisma acá. */
export type AddToCartProduct = {
  id: string;
  slug: string;
  name: string;
  colorName: string | null;
  price: number;
  images: { url: string }[];
  variants: { size: Size; stock: number }[];
};

export function AddToCartForm({ product }: { product: AddToCartProduct }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [size, setSize] = useState<Size | null>(null);

  const stockBySize = new Map(product.variants.map((v) => [v.size, v.stock]));
  const hasAnyStock = SIZES.some((s) => (stockBySize.get(s) ?? 0) > 0);
  const selectedStock = size ? (stockBySize.get(size) ?? 0) : 0;

  function handleAdd() {
    if (!size) return;

    addItem({
      productId: product.id,
      productName: product.name,
      slug: product.slug,
      image: product.images[0]?.url ?? null,
      colorName: product.colorName,
      price: product.price,
      size,
      quantity: 1,
      maxStock: stockBySize.get(size) ?? 0,
    });

    toast.success("Agregado al carrito", {
      description: `${product.name}${product.colorName ? ` · ${product.colorName}` : ""} — Talle ${size}`,
      action: { label: "Ver carrito", onClick: () => router.push("/carrito") },
    });
  }

  if (!hasAnyStock) {
    return (
      <div className="border-ink/12 border px-5 py-4">
        <p className="eyebrow text-ink">Agotado</p>
        <p className="text-ink-muted mt-2 text-sm">
          Esta prenda salió en tirada corta y ya no quedan unidades. Escribinos si querés que te
          avisemos cuando vuelva.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <p className="eyebrow text-ink-muted">Talle</p>
        <p className="text-ink-muted text-xs">Moldería oversize</p>
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
          ? "Elegí un talle para continuar."
          : selectedStock <= 3
            ? `Quedan ${selectedStock} ${selectedStock === 1 ? "unidad" : "unidades"} en ${size}.`
            : `Disponible en ${size}.`}
      </p>

      <Button
        type="button"
        onClick={handleAdd}
        disabled={!size}
        size="lg"
        className="mt-5 w-full"
      >
        Agregar al carrito
      </Button>
    </div>
  );
}
