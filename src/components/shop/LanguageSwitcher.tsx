"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useI18n } from "@/i18n/client";
import {
  hasLocale,
  locales,
  localePath,
  stripLocale,
  type Locale,
} from "@/i18n/config";

/** Cada idioma se nombra en sí mismo: quien no entiende el actual igual reconoce el suyo. */
const LANGUAGE_NAMES: Record<Locale, string> = { es: "Español", en: "English" };

/**
 * Selector segmentado ES | EN con el globo adelante (la señal universal de
 * "idioma"). El idioma actual queda relleno y no es clickeable; el otro es un
 * link a la misma página en ese idioma (/es/productos/x ↔ /en/productos/x).
 * El proxy guarda la elección en una cookie, así las próximas visitas sin
 * idioma en la URL caen en el elegido.
 *
 * En la preview del admin (/admin/preview, sin idioma en la URL) cambia ?lang.
 */
export function LanguageSwitcher() {
  const { lang, t } = useI18n();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function hrefFor(target: Locale) {
    const params = new URLSearchParams(searchParams);
    if (hasLocale(pathname.split("/")[1])) {
      const query = params.toString();
      return (
        localePath(target, stripLocale(pathname)) + (query ? `?${query}` : "")
      );
    }
    params.set("lang", target);
    return `${pathname}?${params.toString()}`;
  }

  return (
    <div
      role="group"
      aria-label={t.header.languageLabel}
      className="border-ink/15 hover:border-ink/40 flex h-10 shrink-0 items-stretch gap-0.5 border p-1 transition-colors"
    >
      {locales.map((locale) =>
        locale === lang ? (
          <span
            key={locale}
            aria-current="true"
            title={LANGUAGE_NAMES[locale]}
            className="eyebrow bg-ink text-bone flex min-w-8 items-center justify-center px-1.5 text-[0.65rem]"
          >
            <span aria-hidden="true">{locale.toUpperCase()}</span>
            <span className="sr-only">{LANGUAGE_NAMES[locale]}</span>
          </span>
        ) : (
          <Link
            key={locale}
            href={hrefFor(locale)}
            // Cambiar de idioma es poco frecuente: no vale la pena precargar la otra versión.
            prefetch={false}
            hrefLang={locale}
            lang={locale}
            aria-label={t.header.switchLabel}
            title={t.header.switchLabel}
            className="eyebrow text-ink-muted hover:text-ink hover:bg-ink/5 flex min-w-8 items-center justify-center px-1.5 text-[0.65rem] transition-colors"
          >
            {locale.toUpperCase()}
          </Link>
        ),
      )}
    </div>
  );
}

