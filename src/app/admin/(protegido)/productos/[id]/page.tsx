import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import { ColorVariantLinker } from "@/components/admin/ColorVariantLinker";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { PageHeader } from "@/components/admin/PageHeader";

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
    <div className="max-w-3xl space-y-4 sm:space-y-6">
      <PageHeader
        back={{ href: "/admin/productos", label: "Productos" }}
        title={product.name}
        subtitle={product.colorName ? `Color: ${product.colorName}` : "Editar producto"}
      />

      <ProductForm
        productId={product.id}
        categories={categories}
        otherProducts={[]}
        initialProduct={{
          name: product.name,
          description: product.description,
          price: Number(product.price),
          colorName: product.colorName,
          nameEn: product.nameEn,
          descriptionEn: product.descriptionEn,
          colorNameEn: product.colorNameEn,
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

      {/* Acción destructiva al final, lejos del pulgar mientras se edita. */}
      <section className="rounded-xl border border-red-200 bg-white p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-neutral-900">Eliminar producto</h2>
        <p className="mt-1 mb-4 text-sm text-neutral-500">
          Deja de existir en la tienda y en el admin. No se puede deshacer.
        </p>
        <DeleteProductButton productId={product.id} productName={product.name} />
      </section>
    </div>
  );
}
