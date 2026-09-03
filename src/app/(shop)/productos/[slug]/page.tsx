import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { ColorSwatches } from "@/components/shop/ColorSwatches";
import { AddToCartForm } from "@/components/shop/AddToCartForm";
import { formatPrice } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
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

  if (!product || !product.isActive) notFound();

  const siblings = product.group?.products.filter((p) => p.id !== product.id) ?? [];

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:gap-12">
      <ProductGallery images={product.images} alt={product.name} />

      <div>
        {product.category && (
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            {product.category.name}
          </p>
        )}
        <h1 className="mt-1 text-2xl font-semibold text-neutral-900">
          {product.name}
          {product.colorName ? ` · ${product.colorName}` : ""}
        </h1>
        <p className="mt-2 text-xl text-neutral-700">{formatPrice(product.price)}</p>

        {siblings.length > 0 && (
          <div className="mt-6">
            <ColorSwatches currentColorName={product.colorName} siblings={siblings} />
          </div>
        )}

        <div className="mt-6">
          <AddToCartForm product={product} />
        </div>

        <div className="mt-10 border-t border-neutral-200 pt-6">
          <h2 className="text-sm font-medium text-neutral-900">Descripción</h2>
          <p className="mt-2 whitespace-pre-line text-sm text-neutral-600">
            {product.description}
          </p>
        </div>
      </div>
    </div>
  );
}
