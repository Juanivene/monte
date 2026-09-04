import { prisma } from "@/lib/prisma";
import { buildContactWhatsAppLink } from "@/lib/whatsapp";
import { ProductCard } from "@/components/shop/ProductCard";
import { CategoryFilter } from "@/components/shop/CategoryFilter";
import { Hero } from "@/components/shop/Hero";
import { StoryStrip } from "@/components/shop/StoryStrip";
import { Lookbook } from "@/components/shop/Lookbook";
import { ValueProps } from "@/components/shop/ValueProps";
import { EmptyState } from "@/components/ui/EmptyState";
import { Marquee } from "@/components/ui/Marquee";
import { Reveal } from "@/components/ui/Reveal";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;

  const [categories, products, totalActive] = await Promise.all([
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
  ]);

  const activeCategory = categories.find((c) => c.slug === categoria);
  const whatsappUrl = buildContactWhatsAppLink();

  return (
    <>
      <Hero productCount={totalActive} />

      <div className="bg-ink text-bone py-5 sm:py-7">
        <Marquee
          items={["Otoño Invierno 26", "Monte", "Tiradas cortas", "Tucumán"]}
          separator="—"
          speed="34s"
          className="headline text-[13vw] leading-none sm:text-[7rem]"
        />
      </div>

      <section id="catalogo" className="container-page scroll-mt-28 py-16 sm:py-24">
        <Reveal>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-ink-muted">Catálogo</p>
              <h2 className="headline mt-3 text-4xl sm:text-5xl">
                {activeCategory ? activeCategory.name : "Toda la colección"}
              </h2>
            </div>
            <p className="text-ink-muted max-w-sm text-sm leading-relaxed">
              Talles del XS al XXL. Los stocks se actualizan en vivo: si un talle no aparece, es
              porque ya voló.
            </p>
          </div>

          <CategoryFilter
            categories={categories}
            active={categoria}
            total={products.length}
          />
        </Reveal>

        {products.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              title={
                activeCategory ? `Nada en ${activeCategory.name} por ahora` : "Se viene la primera"
              }
              description={
                activeCategory
                  ? "Probá con otra categoría o mirá todo el catálogo."
                  : "Estamos terminando de cargar la colección. Mientras tanto, date una vuelta por el lookbook."
              }
            />
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 xl:grid-cols-4">
            {products.map((product, i) => (
              <Reveal key={product.id} delay={(i % 4) * 90}>
                <ProductCard product={product} eager={i < 4} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <StoryStrip />
      <Lookbook />
      <ValueProps whatsappUrl={whatsappUrl ?? undefined} />
    </>
  );
}
