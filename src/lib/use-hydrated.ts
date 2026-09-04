"use client";

import { useSyncExternalStore } from "react";

// Referencias estables: useSyncExternalStore exige que los getters no cambien
// entre renders, si no React avisa por posible loop infinito.
const noopSubscribe = () => () => {};
const alwaysTrue = () => true;
const alwaysFalse = () => false;

/**
 * false mientras se renderiza en el servidor y en la pasada de hidratación,
 * true a partir de ahí. Sirve para no pintar algo que depende de una API de
 * navegador (localStorage, matchMedia, etc.) antes de que React termine de
 * hidratar — si no, el HTML del servidor y el del cliente no coinciden.
 */
export function useHydrated() {
  return useSyncExternalStore(noopSubscribe, alwaysTrue, alwaysFalse);
}
