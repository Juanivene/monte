"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/Button";
import { SIZES, type Size } from "@/types";

export function AddToCartForm({
  product,
}: {
  product: {
    id: string;
    slug: string;
    name: string;
    colorName: string | null;
    price: number | string | { toString(): string };
    images: { url: string }[];
    variants: { size: Size; stock: number }[];
  };
}) {
  const { addItem } = useCart();
  const [size, setSize] = useState<Size | null>(null);
  const [added, setAdded] = useState(false);

  const stockBySize = new Map(product.variants.map((v) => [v.size, v.stock]));
  const price = Number(product.price.toString());
  const hasAnyStock = SIZES.some((s) => (stockBySize.get(s) ?? 0) > 0);

  function handleAdd() {
    if (!size) return;
    addItem({
      productId: product.id,
      productName: product.name,
      slug: product.slug,
      image: product.images[0]?.url ?? null,
      colorName: product.colorName,
      price,
      size,
      quantity: 1,
      maxStock: stockBySize.get(size) ?? 0,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  if (!hasAnyStock) {
    return (
      <p className="rounded-lg bg-neutral-100 px-4 py-3 text-sm text-neutral-600">
        Sin stock disponible por el momento.
      </p>
    );
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-neutral-800">Talle</p>
      <div className="flex flex-wrap gap-2">
        {SIZES.map((s) => {
          const stock = stockBySize.get(s) ?? 0;
          const disabled = stock <= 0;
          return (
            <button
              key={s}
              type="button"
              disabled={disabled}
              onClick={() => setSize(s)}
              className={`h-11 min-w-11 rounded-lg border px-3 text-sm font-medium transition ${
                disabled
                  ? "cursor-not-allowed border-neutral-200 text-neutral-300 line-through"
                  : size === s
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 text-neutral-700 hover:border-neutral-500"
              }`}
            >
              {s}
            </button>
          );
        })}
      </div>

      <Button type="button" onClick={handleAdd} disabled={!size} className="mt-5 w-full sm:w-auto">
        {added ? "¡Agregado!" : "Agregar al carrito"}
      </Button>
      {!size && <p className="mt-2 text-xs text-neutral-500">Elegí un talle para continuar</p>}
    </div>
  );
}
