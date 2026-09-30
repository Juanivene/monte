import Link from "next/link";
import type { SiteContent, TextField } from "@/lib/site-content/fields";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { EditableImage } from "@/components/site-editor/EditableImage";
import { EditableText } from "@/components/site-editor/EditableText";

export function Hero({
  productCount,
  content,
}: {
  productCount: number;
  content: SiteContent;
}) {
  const { text, image } = content;
  const t = (field: TextField) => (
    <EditableText field={field} value={text[field]} />
  );

  return (
    <section className="relative overflow-hidden pb-14 pt-6 sm:pt-10 lg:pb-24">
      <div className="container-page grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Texto */}
        <div className="order-2 lg:order-1 lg:col-span-5">
          <Reveal>
            <p className="eyebrow text-ink-muted flex items-center gap-3">
              <span className="bg-accent inline-block h-px w-8" />
              {t("hero.eyebrow")}
            </p>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="headline mt-6 text-[14vw] sm:text-7xl lg:text-[5.25rem]">
              {t("hero.title")}
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="text-ink-soft mt-7 max-w-md text-[0.95rem] leading-relaxed">
              {t("hero.body")}
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="#catalogo">
                <Button size="lg">
                  <EditableText
                    field="hero.ctaPrimary"
                    value={text["hero.ctaPrimary"]}
                    popover
                  />
                </Button>
              </Link>
              <Link href="#lookbook">
                <Button size="lg" variant="secondary">
                  <EditableText
                    field="hero.ctaSecondary"
                    value={text["hero.ctaSecondary"]}
                    popover
                  />
                </Button>
              </Link>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <dl className="border-ink/10 mt-12 grid max-w-md grid-cols-3 gap-4 border-t pt-6">
              <Stat
                value={productCount > 0 ? `${productCount}` : "01"}
                label={t("hero.stat1Label")}
              />
              <Stat value={t("hero.stat2Value")} label={t("hero.stat2Label")} />
              <Stat value={t("hero.stat3Value")} label={t("hero.stat3Label")} />
            </dl>
          </Reveal>
        </div>

        {/* Imágenes */}
        <div className="order-1 lg:order-2 lg:col-span-7">
          <div className="relative">
            <div className="bg-bone-dark relative aspect-4/5 overflow-hidden sm:aspect-3/4 lg:aspect-4/5">
              <EditableImage
                field="hero.main"
                image={image["hero.main"]}
                loading="eager"
                fetchPriority="high"
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="animate-kenburns object-cover"
              />
              <div className="from-ink/25 pointer-events-none absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
            </div>

            {/* Foto chica montada sobre la grande */}
            <div className="border-bone bg-bone-dark absolute -bottom-6 -left-4 hidden aspect-square w-36 overflow-hidden border-4 sm:block lg:-bottom-10 lg:-left-10 lg:w-52">
              <EditableImage
                field="hero.small"
                image={image["hero.small"]}
                sizes="(min-width: 1024px) 13rem, 9rem"
                className="object-cover"
              />
            </div>

            <span className="eyebrow text-ink-muted absolute -right-2 top-6 hidden origin-right -rotate-90 lg:block">
              <EditableText
                field="hero.side"
                value={text["hero.side"]}
                popover
              />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({
  value,
  label,
}: {
  value: React.ReactNode;
  label: React.ReactNode;
}) {
  return (
    <div>
      <dt className="headline text-ink text-2xl">{value}</dt>
      <dd className="text-ink-muted mt-1 text-[0.7rem] leading-tight">
        {label}
      </dd>
    </div>
  );
}
