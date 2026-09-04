"use client";

import { useMemo, useSyncExternalStore } from "react";
import { cartStore } from "./cart-store";

// Referencias estables: useSyncExternalStore exige que los getters no cambien
// entre renders, si no React avisa por posible loop infinito.
const noopSubscribe = () => () => {};
const alwaysTrue = () => true;
const alwaysFalse = () => false;

/**
 * false mientras se renderiza en el servidor y en la pasada de hidratación,
 * true a partir de ahí. Sirve para no pintar el carrito de localStorage antes
 * de que React termine de hidratar (si no, el HTML no coincide).
 */
function useIsHydrated() {
  return useSyncExternalStore(noopSubscribe, alwaysTrue, alwaysFalse);
}

export function useCart() {
  const items = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    cartStore.getServerSnapshot,
  );

  const isHydrated = useIsHydrated();

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items],
  );
  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

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
