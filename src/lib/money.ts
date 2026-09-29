import type { Locale } from "@/i18n/config";

// Mismo número, formato de cada idioma: "$ 68" en español, "$68" en inglés.
const formatters: Record<Locale, Intl.NumberFormat> = {
  es: new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }),
  en: new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }),
};

/** Acepta number, string o Prisma.Decimal (via toString/toNumber). */
export function formatPrice(
  amount: number | string | { toString(): string },
  lang: Locale = "es",
): string {
  const value = typeof amount === "number" ? amount : Number(amount.toString());
  return formatters[lang].format(value);
}
