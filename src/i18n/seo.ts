import type { Metadata } from "next";
import { defaultLocale, localePath, locales, type Locale } from "./config";

/**
 * canonical + hreflang de una página: le dice a Google que /es/x y /en/x son
 * la misma página en dos idiomas (e indexa las dos), y que el inglés es la
 * versión por defecto para el resto de los idiomas.
 */
export function languageAlternates(lang: Locale, path: string): Metadata["alternates"] {
  return {
    canonical: localePath(lang, path),
    languages: {
      ...Object.fromEntries(locales.map((l) => [l, localePath(l, path)])),
      "x-default": localePath(defaultLocale, path),
    },
  };
}
