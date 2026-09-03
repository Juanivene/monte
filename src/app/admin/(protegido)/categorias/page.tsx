import { prisma } from "@/lib/prisma";
import { CategoryManager } from "@/components/admin/CategoryManager";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="text-xl font-semibold text-neutral-900">Categorías</h1>
      <div className="mt-6 max-w-xl">
        <CategoryManager initialCategories={categories} />
      </div>
    </div>
  );
}
