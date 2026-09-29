import es, { type Dictionary } from "./dictionaries/es";
import en from "./dictionaries/en";
import type { Locale } from "./config";

export * from "./config";
export type { Dictionary };

/**
 * Los dos diccionarios son chicos, así que se importan directo (servidor y
 * cliente) en vez de cargarse por separado.
 */
const dictionaries: Record<Locale, Dictionary> = { es, en };

export function getDictionary(lang: Locale): Dictionary {
  return dictionaries[lang];
}

/**
 * Traduce un mensaje de validación del checkout (una clave de `errors`, ver
 * checkoutSchema). Si no es una clave conocida, un mensaje genérico.
 */
export function checkoutErrorMessage(lang: Locale, key: string | undefined): string {
  const errors = getDictionary(lang).errors as Record<string, unknown>;
  const message = key ? errors[key] : undefined;
  return typeof message === "string" ? message : getDictionary(lang).errors.invalid;
}

/**
 * Elige la versión de un texto cargado en el admin. Si el inglés no está
 * cargado, se muestra el español en vez de dejar un hueco.
 */
export function pick(lang: Locale, es: string, en: string | null | undefined): string;
export function pick(
  lang: Locale,
  es: string | null,
  en: string | null | undefined,
): string | null;
export function pick(lang: Locale, es: string | null, en: string | null | undefined) {
  return lang === "en" && en?.trim() ? en : es;
}
