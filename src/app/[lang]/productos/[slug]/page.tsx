import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/money";
import { buildContactWhatsAppLink } from "@/lib/whatsapp";
import { getDictionary, hasLocale, localePath, pick, type Locale } from "@/i18n";
import { languageAlternates } from "@/i18n/seo";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { ColorSwatches } from "@/components/shop/ColorSwatches";
import { AddToCartForm } from "@/components/shop/AddToCartForm";
import { ProductCard } from "@/components/shop/ProductCard";
import { Accordion } from "@/components/ui/Accordion";
import { Reveal } from "@/components/ui/Reveal";

export const dynamic = "force-dynamic";

function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { order: "asc" } },
      variants: true,
      category: { include: { parent: true } },
      group: {
        include: {
          products: {
            where: { isActive: true },
            include: { images: { orderBy: { order: "asc" }, take: 1 } },
          },
        },
      },
    },
  });
}

/** Nombre, color y descripción en el idioma pedido (con el español de respaldo). */
function localize(
  lang: Locale,
  product: {
    name: string;
    nameEn: string | null;
    colorName: string | null;
    colorNameEn: string | null;
    description: string;
    descriptionEn: string | null;
  },
) {
  const name = pick(lang, product.name, product.nameEn);
  const colorName = pick(lang, product.colorName, product.colorNameEn);
  return {
    name,
    colorName,
    description: pick(lang, product.description, product.descriptionEn),
    title: colorName ? `${name} · ${colorName}` : name,
  };
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/productos/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const product = await getProduct(slug);
  if (!product || !product.isActive) return { title: getDictionary(lang).meta.productNotFound };

  const { title, description } = localize(lang, product);

  return {
    title,
    description: description.slice(0, 160),
    alternates: languageAlternates(lang, `/productos/${slug}`),
    openGraph: {
      title,
      description: description.slice(0, 160),
      images: product.images[0] ? [{ url: product.images[0].url }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: PageProps<"/[lang]/productos/[slug]">) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const product = await getProduct(slug);

  if (!product || !product.isActive) notFound();

  const { name, colorName, description, title } = localize(lang, product);
  const categoryName = product.category
    ? pick(lang, product.category.name, product.category.nameEn)
    : null;

  const siblings = product.group?.products.filter((p) => p.id !== product.id) ?? [];
  const excludedIds = [product.id, ...siblings.map((s) => s.id)];

  const related = await prisma.product.findMany({
    where: {
      isActive: true,
      id: { notIn: excludedIds },
      ...(product.categoryId ? { categoryId: product.categoryId } : {}),
    },
    include: {
      images: { orderBy: { order: "asc" }, take: 2 },
      variants: true,
    },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  const whatsappUrl = buildContactWhatsAppLink(t.product.whatsappQuestion(title));

  return (
    <>
      <div className="container-page pt-6">
        <nav aria-label={t.product.breadcrumb} className="eyebrow text-ink-muted flex gap-2">
          <Link href={localePath(lang, "/")} className="hover:text-ink transition-colors">
            {t.product.home}
          </Link>
          <span aria-hidden="true">/</span>
          {product.category?.parent ? (
            <>
              <Link
                href={localePath(lang, `/?categoria=${product.category.parent.slug}`)}
                className="hover:text-ink transition-colors"
              >
                {pick(lang, product.category.parent.name, product.category.parent.nameEn)}
              </Link>
              <span aria-hidden="true">/</span>
            </>
          ) : null}
          {product.category ? (
            <>
              <Link
                href={localePath(lang, `/?categoria=${product.category.slug}`)}
                className="hover:text-ink transition-colors"
              >
                {categoryName}
              </Link>
              <span aria-hidden="true">/</span>
            </>
          ) : null}
          <span className="text-ink truncate">{name}</span>
        </nav>
      </div>

      <div className="container-page grid gap-10 py-8 lg:grid-cols-2 lg:items-start lg:gap-16 lg:py-12">
        <div className="lg:sticky lg:top-28">
          <ProductGallery images={product.images} alt={name} />
        </div>

        <div className="lg:py-4">
          {categoryName && <p className="eyebrow text-ink-muted">{categoryName}</p>}

          <h1 className="headline mt-3 text-4xl sm:text-5xl">{name}</h1>

          <p className="text-ink mt-4 text-xl tabular-nums">{formatPrice(product.price, lang)}</p>
          <p className="text-ink-muted mt-1 text-xs">{t.product.finalPrice}</p>

          {siblings.length > 0 && (
            <div className="mt-9">
              <ColorSwatches
                lang={lang}
                currentColorName={colorName}
                currentImage={product.images[0]?.url}
                siblings={siblings.map((s) => ({
                  ...s,
                  colorName: pick(lang, s.colorName, s.colorNameEn),
                }))}
              />
            </div>
          )}

          <div className="mt-9">
            <AddToCartForm
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                nameEn: product.nameEn,
                colorName: product.colorName,
                colorNameEn: product.colorNameEn,
                price: Number(product.price),
                images: product.images.map((image) => ({ url: image.url })),
                variants: product.variants.map((variant) => ({
                  size: variant.size,
                  stock: variant.stock,
                })),
              }}
            />
          </div>

          <div className="mt-10">
            <Accordion title={t.product.description} defaultOpen>
              <p className="whitespace-pre-line">{description}</p>
            </Accordion>
            <Accordion title={t.product.shippingTitle}>
              <p>{t.product.shippingBody}</p>
            </Accordion>
            <Accordion title={t.product.returnsTitle}>
              <p>{t.product.returnsBody}</p>
            </Accordion>
          </div>

          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="eyebrow text-ink-muted link-underline hover:text-ink mt-8 inline-block transition-colors"
            >
              {t.product.sizeQuestion}
            </a>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="container-page py-16 sm:py-24">
          <Reveal>
            <div className="border-ink/12 flex items-end justify-between gap-4 border-b pb-6">
              <h2 className="headline text-3xl sm:text-4xl">{t.product.keepBrowsing}</h2>
              <Link
                href={localePath(lang, "/")}
                className="eyebrow text-ink-muted link-underline hover:text-ink transition-colors"
              >
                {t.product.viewAll}
              </Link>
            </div>
          </Reveal>

          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 xl:grid-cols-4">
            {related.map((item, i) => (
              <Reveal key={item.id} delay={i * 90}>
                <ProductCard lang={lang} product={item} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
