"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useI18n } from "@/i18n/client";
import { hasLocale, localePath, otherLocale, stripLocale } from "@/i18n/config";

/**
 * Lleva a la misma página en el otro idioma (/es/productos/x ↔ /en/productos/x).
 * El proxy guarda la elección en una cookie, así las próximas visitas sin
 * idioma en la URL caen en el elegido.
 *
 * En la preview del admin (/admin/preview, sin idioma en la URL) cambia ?lang.
 */
export function LanguageSwitcher() {
  const { lang, t } = useI18n();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const target = otherLocale(lang);

  const params = new URLSearchParams(searchParams);
  let href: string;
  if (hasLocale(pathname.split("/")[1])) {
    const query = params.toString();
    href = localePath(target, stripLocale(pathname)) + (query ? `?${query}` : "");
  } else {
    params.set("lang", target);
    href = `${pathname}?${params.toString()}`;
  }

  return (
    <Link
      href={href}
      // Cambiar de idioma es poco frecuente: no vale la pena precargar la otra versión.
      prefetch={false}
      hrefLang={target}
      lang={target}
      aria-label={t.header.switchLabel}
      title={t.header.switchTo}
      className="border-ink/15 hover:border-ink eyebrow flex h-10 min-w-10 shrink-0 items-center justify-center border px-2 text-[0.65rem] transition-colors"
    >
      {t.header.switchToShort}
    </Link>
  );
}
