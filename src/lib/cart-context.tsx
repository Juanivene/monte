"use client";

import { useMemo, useSyncExternalStore } from "react";
import { cartStore } from "./cart-store";

export function useCart() {
  const items = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    cartStore.getServerSnapshot,
  );

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items],
  );
  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const isHydrated = typeof window !== "undefined";

  return {
    items,
    addItem: cartStore.addItem,
    removeItem: cartStore.removeItem,
    updateQuantity: cartStore.updateQuantity,
    clear: cartStore.clear,
    subtotal,
    itemCount,
    isHydrated,
  };
}
