import { prisma } from "@/lib/prisma";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { PageHeader } from "@/components/admin/PageHeader";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="max-w-xl">
      <PageHeader title="Categorías" />
      <CategoryManager initialCategories={categories} />
    </div>
  );
}
