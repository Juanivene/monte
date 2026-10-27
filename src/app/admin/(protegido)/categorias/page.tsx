import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { PageHeader } from "@/components/admin/PageHeader";

export default async function AdminCategoriesPage() {
  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: [{ position: "asc" }, { name: "asc" }] }),
    prisma.product.findMany({ select: { categoryId: true } }),
  ]);

  const productCounts: Record<string, number> = {};
  for (const { categoryId } of products) {
    if (categoryId) productCounts[categoryId] = (productCounts[categoryId] ?? 0) + 1;
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Categorías"
        action={
          <Link href="/admin/categorias/orden">
            <Button variant="secondary">Ordenar</Button>
          </Link>
        }
      />
      <CategoryManager initialCategories={categories} productCounts={productCounts} />
    </div>
  );
}
