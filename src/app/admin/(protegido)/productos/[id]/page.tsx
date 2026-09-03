import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import { ColorVariantLinker } from "@/components/admin/ColorVariantLinker";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: "asc" } },
        variants: true,
        group: { include: { products: { select: { id: true, name: true, colorName: true } } } },
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  const siblings = product.group?.products.filter((p) => p.id !== product.id) ?? [];
  const excludeIds = [product.id, ...siblings.map((s) => s.id)];
  const linkableProducts = await prisma.product.findMany({
    where: { id: { notIn: excludeIds } },
    select: { id: true, name: true, colorName: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900">Editar producto</h1>
        <DeleteProductButton productId={product.id} />
      </div>

      <ProductForm
        productId={product.id}
        categories={categories}
        otherProducts={[]}
        initialProduct={{
          name: product.name,
          description: product.description,
          price: Number(product.price),
          colorName: product.colorName,
          categoryId: product.categoryId,
          isActive: product.isActive,
          images: product.images.map((i) => i.url),
          variants: product.variants.map((v) => ({ size: v.size, stock: v.stock })),
        }}
      />

      <ColorVariantLinker
        productId={product.id}
        siblings={siblings}
        linkableProducts={linkableProducts}
      />
    </div>
  );
}
