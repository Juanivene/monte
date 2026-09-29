import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import { PageHeader } from "@/components/admin/PageHeader";

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
      <PageHeader back={{ href: "/admin/productos", label: "Productos" }} title="Nuevo producto" />
      <ProductForm categories={categories} otherProducts={otherProducts} />
    </div>
  );
}
