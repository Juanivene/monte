import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { CategoryOrderBoard } from "@/components/admin/CategoryOrderBoard";

export default async function AdminCategoryOrderPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ position: "asc" }, { name: "asc" }],
  });

  return (
    <div className="max-w-3xl">
      <PageHeader
        back={{ href: "/admin/categorias", label: "Categorías" }}
        title="Orden en la tienda"
        subtitle="Arrastrá las categorías o usá las flechas. Se guarda solo y la tienda se actualiza al instante."
      />
      {categories.length === 0 ? (
        <p className="text-sm text-neutral-500">Todavía no creaste ninguna categoría.</p>
      ) : (
        <CategoryOrderBoard
          initialItems={categories.map((c) => ({ id: c.id, name: c.name, parentId: c.parentId }))}
        />
      )}
    </div>
  );
}
