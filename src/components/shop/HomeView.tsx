import { prisma } from "@/lib/prisma";
import { buildContactWhatsAppLink } from "@/lib/whatsapp";
import type { SiteContent } from "@/lib/site-content/fields";
import { getDictionary, pick, type Locale } from "@/i18n";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { CategoryFilter } from "@/components/shop/CategoryFilter";
import { Hero } from "@/components/shop/Hero";
import { StoryStrip } from "@/components/shop/StoryStrip";
import { Lookbook } from "@/components/shop/Lookbook";
import { ValueProps } from "@/components/shop/ValueProps";
import { EmptyState } from "@/components/ui/EmptyState";
import { Marquee } from "@/components/ui/Marquee";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Contenido del home. Lo usan la tienda (con el contenido publicado) y el
 * editor de /admin/preview (con el borrador), así los dos son idénticos.
 */
export async function HomeView({
  lang,
  categoria,
  content,
}: {
  lang: Locale;
  categoria?: string;
  content: SiteContent;
}) {
  const t = getDictionary(lang);
  const [categories, products, totalActive, heroLegends] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: {
        isActive: true,
        ...(categoria ? { category: { slug: categoria } } : {}),
      },
      include: {
        // dos imágenes: portada + la que aparece al pasar el mouse
        images: { orderBy: { order: "asc" }, take: 2 },
        variants: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.legend.findMany({ where: { group: "HERO" }, orderBy: { order: "asc" } }),
  ]);

  const localizedCategories = categories.map((c) => ({
    slug: c.slug,
    name: pick(lang, c.name, c.nameEn),
  }));
  const activeCategory = localizedCategories.find((c) => c.slug === categoria);
  const whatsappUrl = buildContactWhatsAppLink(t.whatsapp.contact);

  return (
    <>
      <Hero productCount={totalActive} content={content} />

      {heroLegends.length > 0 && (
        <div className="bg-night text-paper py-5 sm:py-7">
          <Marquee
            items={heroLegends.map((legend) => pick(lang, legend.text, legend.textEn))}
            separator="—"
            speed="34s"
            className="headline text-[13vw] leading-none sm:text-[7rem]"
          />
        </div>
      )}

      <section
        id="catalogo"
        className="container-page scroll-mt-28 py-16 sm:py-24"
      >
        <Reveal>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-ink-muted">{t.catalog.eyebrow}</p>
              <h2 className="headline mt-3 text-4xl sm:text-5xl">
                {activeCategory ? activeCategory.name : t.catalog.allTitle}
              </h2>
            </div>
            <p className="text-ink-muted max-w-sm text-sm leading-relaxed">
              {t.catalog.sizesNote}
            </p>
          </div>

          <CategoryFilter
            lang={lang}
            categories={localizedCategories}
            active={categoria}
            total={products.length}
          />
        </Reveal>

        {products.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              title={
                activeCategory
                  ? t.catalog.emptyCategoryTitle(activeCategory.name)
                  : t.catalog.emptyTitle
              }
              description={activeCategory ? t.catalog.emptyCategoryBody : t.catalog.emptyBody}
            />
          </div>
        ) : (
          // key: al cambiar de categoría la grilla vuelve a la primera tanda
          <ProductGrid
            key={categoria ?? "todo"}
            items={products.map((product, i) => (
              <Reveal key={product.id} delay={(i % 4) * 90}>
                <ProductCard lang={lang} product={product} eager={i < 4} />
              </Reveal>
            ))}
          />
        )}
      </section>

      <StoryStrip content={content} />
      <Lookbook content={content} />
      <ValueProps whatsappUrl={whatsappUrl ?? undefined} content={content} />
    </>
  );
}
