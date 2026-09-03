import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const [categories, otherProducts] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      select: { id: true, name: true, colorName: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-semibold text-neutral-900">Nuevo producto</h1>
      <div className="mt-6">
        <ProductForm categories={categories} otherProducts={otherProducts} />
      </div>
    </div>
  );
}
