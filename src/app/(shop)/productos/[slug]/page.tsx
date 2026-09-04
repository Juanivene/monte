import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/money";
import { buildContactWhatsAppLink } from "@/lib/whatsapp";
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
      category: true,
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product || !product.isActive) return { title: "Producto no encontrado" };

  const title = product.colorName ? `${product.name} · ${product.colorName}` : product.name;

  return {
    title,
    description: product.description.slice(0, 160),
    openGraph: {
      title,
      description: product.description.slice(0, 160),
      images: product.images[0] ? [{ url: product.images[0].url }] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product || !product.isActive) notFound();

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

  const whatsappUrl = buildContactWhatsAppLink(
    `¡Hola! Quería consultar por "${product.name}"${product.colorName ? ` (${product.colorName})` : ""}.`,
  );

  return (
    <>
      <div className="container-page pt-6">
        <nav aria-label="Migas de pan" className="eyebrow text-ink-muted flex gap-2">
          <Link href="/" className="hover:text-ink transition-colors">
            Inicio
          </Link>
          <span aria-hidden="true">/</span>
          {product.category ? (
            <>
              <Link
                href={`/?categoria=${product.category.slug}`}
                className="hover:text-ink transition-colors"
              >
                {product.category.name}
              </Link>
              <span aria-hidden="true">/</span>
            </>
          ) : null}
          <span className="text-ink truncate">{product.name}</span>
        </nav>
      </div>

      <div className="container-page grid gap-10 py-8 lg:grid-cols-2 lg:items-start lg:gap-16 lg:py-12">
        <div className="lg:sticky lg:top-28">
          <ProductGallery images={product.images} alt={product.name} />
        </div>

        <div className="lg:py-4">
          {product.category && (
            <p className="eyebrow text-ink-muted">{product.category.name}</p>
          )}

          <h1 className="headline mt-3 text-4xl sm:text-5xl">{product.name}</h1>

          <p className="text-ink mt-4 text-xl tabular-nums">{formatPrice(product.price)}</p>
          <p className="text-ink-muted mt-1 text-xs">Precio final. El envío se coordina aparte.</p>

          {siblings.length > 0 && (
            <div className="mt-9">
              <ColorSwatches
                currentColorName={product.colorName}
                currentImage={product.images[0]?.url}
                siblings={siblings}
              />
            </div>
          )}

          <div className="mt-9">
            <AddToCartForm
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                colorName: product.colorName,
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
            <Accordion title="Descripción" defaultOpen>
              <p className="whitespace-pre-line">{product.description}</p>
            </Accordion>
            <Accordion title="Envíos">
              <p>
                Despachamos dentro de las 24 h hábiles. Envíos a todo el país por correo y entrega
                en moto dentro de CABA. El costo se coordina por WhatsApp junto con el pago.
              </p>
            </Accordion>
            <Accordion title="Cambios y devoluciones">
              <p>
                Tenés 30 días desde que recibís el pedido para cambiar el talle, siempre que la
                prenda esté sin uso y con su etiqueta.
              </p>
            </Accordion>
          </div>

          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="eyebrow text-ink-muted link-underline hover:text-ink mt-8 inline-block transition-colors"
            >
              ¿Dudas con el talle? Consultanos →
            </a>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="container-page py-16 sm:py-24">
          <Reveal>
            <div className="border-ink/12 flex items-end justify-between gap-4 border-b pb-6">
              <h2 className="headline text-3xl sm:text-4xl">Seguí mirando</h2>
              <Link
                href="/"
                className="eyebrow text-ink-muted link-underline hover:text-ink transition-colors"
              >
                Ver todo →
              </Link>
            </div>
          </Reveal>

          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 xl:grid-cols-4">
            {related.map((item, i) => (
              <Reveal key={item.id} delay={i * 90}>
                <ProductCard product={item} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
