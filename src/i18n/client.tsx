"use client";

import { createContext, useContext } from "react";
import { getDictionary, type Dictionary, type Locale } from "./index";

const LocaleContext = createContext<Locale>("es");

/** Lo ponen el layout de la tienda y la preview del admin. */
export function LocaleProvider({ lang, children }: { lang: Locale; children: React.ReactNode }) {
  return <LocaleContext.Provider value={lang}>{children}</LocaleContext.Provider>;
}

/**
 * Idioma y textos para componentes de cliente. Fuera de un LocaleProvider
 * (el admin) devuelve español.
 */
export function useI18n(): { lang: Locale; t: Dictionary } {
  const lang = useContext(LocaleContext);
  return { lang, t: getDictionary(lang) };
}
