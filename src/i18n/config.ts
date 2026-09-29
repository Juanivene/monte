/**
 * Idiomas de la tienda. El admin queda siempre en español y no pasa por acá.
 *
 * URLs separadas por idioma (/es/..., /en/...) para que Google indexe cada
 * versión por su lado. El proxy (src/proxy.ts) manda las URLs sin prefijo al
 * idioma que corresponde: el último elegido (cookie), si no el del navegador,
 * y si no se reconoce ninguno, inglés.
 */
export const locales = ["es", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Cookie con el último idioma visitado: así el selector "se recuerda". */
export const LOCALE_COOKIE = "NEXT_LOCALE";

export function hasLocale(value: string | null | undefined): value is Locale {
  return locales.includes(value as Locale);
}

export function otherLocale(lang: Locale): Locale {
  return lang === "es" ? "en" : "es";
}

/** Para <html lang>, Open Graph y formatos. */
export const localeTags: Record<Locale, { html: string; og: string }> = {
  es: { html: "es-AR", og: "es_AR" },
  en: { html: "en-US", og: "en_US" },
};

/**
 * Antepone el idioma a una ruta de la tienda:
 * "/" → "/en", "/#lookbook" → "/en#lookbook", "/carrito" → "/en/carrito".
 */
export function localePath(lang: Locale, path: string): string {
  const rest = path === "/" || path.startsWith("/?") || path.startsWith("/#") ? path.slice(1) : path;
  return `/${lang}${rest}`;
}

/** Saca el prefijo de idioma: "/en/carrito" → "/carrito", "/en" → "/". */
export function stripLocale(pathname: string): string {
  const [, first, ...rest] = pathname.split("/");
  if (!hasLocale(first)) return pathname;
  return `/${rest.join("/")}`;
}

/**
 * Elige idioma a partir del header Accept-Language, respetando el orden de
 * preferencia del navegador. Devuelve null si no pide ninguno de los nuestros.
 */
export function localeFromAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return { lang: tag.trim().toLowerCase().split("-")[0], q: q ? Number(q.split("=")[1]) : 1 };
    })
    .filter((entry) => entry.lang && entry.q > 0)
    .sort((a, b) => b.q - a.q);
  const match = ranked.find((entry) => hasLocale(entry.lang));
  return match ? (match.lang as Locale) : null;
}
