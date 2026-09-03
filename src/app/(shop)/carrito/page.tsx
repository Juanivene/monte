"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/money";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, isHydrated } = useCart();

  if (!isHydrated) return null;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Tu carrito está vacío"
          description="Todavía no agregaste ningún producto."
          action={
            <Link href="/">
              <Button>Ver catálogo</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-xl font-semibold text-neutral-900">Tu carrito</h1>

      <ul className="mt-6 divide-y divide-neutral-200">
        {items.map((item) => (
          <li key={`${item.productId}-${item.size}`} className="flex gap-4 py-5">
            <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100">
              {item.image && (
                <Image src={item.image} alt={item.productName} fill sizes="80px" className="object-cover" />
              )}
            </div>
            <div className="flex flex-1 flex-col justify-between">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    {item.productName}
                    {item.colorName ? ` · ${item.colorName}` : ""}
                  </p>
                  <p className="text-xs text-neutral-500">Talle {item.size}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId, item.size)}
                  className="text-xs text-neutral-400 hover:text-red-600"
                >
                  Eliminar
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="h-7 w-7 rounded-full border border-neutral-300 text-sm disabled:opacity-30"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                    disabled={item.quantity >= item.maxStock}
                    className="h-7 w-7 rounded-full border border-neutral-300 text-sm disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
                <p className="text-sm font-medium text-neutral-900">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between border-t border-neutral-200 pt-4">
        <span className="text-sm text-neutral-600">Total</span>
        <span className="text-lg font-semibold text-neutral-900">{formatPrice(subtotal)}</span>
      </div>

      <Link href="/checkout" className="mt-6 block">
        <Button className="w-full">Continuar</Button>
      </Link>
    </div>
  );
}
