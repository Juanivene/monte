"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export function Header() {
  const { itemCount, isHydrated } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          {process.env.NEXT_PUBLIC_SITE_NAME || "Mi Tienda"}
        </Link>

        <Link
          href="/carrito"
          className="relative flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium transition hover:border-neutral-400"
        >
          Carrito
          {isHydrated && itemCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-900 px-1 text-xs font-semibold text-white">
              {itemCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
