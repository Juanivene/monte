"use client";

import Link from "next/link";
import Image from "next/image";
import { shots } from "@/lib/lookbook";
import { useI18n } from "@/i18n/client";
import { localePath } from "@/i18n/config";
import { Button } from "@/components/ui/Button";
import { RichText } from "@/components/site-editor/RichText";

/**
 * 404 de la tienda. Es de cliente porque not-found no recibe params: el
 * idioma sale del LocaleProvider del layout de [lang].
 */
export function NotFoundContent() {
  const { lang, t } = useI18n();

  return (
    <div className="container-page grid items-center gap-10 py-16 lg:grid-cols-2 lg:gap-20 lg:py-24">
      <div>
        <p className="eyebrow text-ink-muted">{t.notFound.eyebrow}</p>
        <h1 className="headline mt-4 text-5xl sm:text-6xl lg:text-7xl">
          <RichText value={t.notFound.title} />
        </h1>
        <p className="text-ink-soft mt-6 max-w-md text-[0.95rem] leading-relaxed">
          {t.notFound.body}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={localePath(lang, "/")}>
            <Button size="lg">{t.notFound.cta}</Button>
          </Link>
          <Link href={localePath(lang, "/#lookbook")}>
            <Button size="lg" variant="secondary">
              {t.notFound.lookbook}
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-bone-dark relative aspect-4/5 overflow-hidden">
        <Image
          src={shots.buzoTealPasaje.src}
          alt={lang === "en" ? shots.buzoTealPasaje.altEn : shots.buzoTealPasaje.alt}
          placeholder="blur"
          fill
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}
