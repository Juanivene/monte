import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { ProductFilters } from "@/components/admin/ProductFilters";
import { ProductsTable } from "@/components/admin/ProductsTable";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string }>;
}) {
  const { q, categoria } = await searchParams;
  const query = q?.trim();

  // El filtrado se resuelve acá, en el where de la consulta: nunca se trae
  // todo el catálogo al front para filtrarlo ahí.
  const where: Prisma.ProductWhereInput = {
    ...(query ? { name: { contains: query, mode: "insensitive" } } : {}),
    ...(categoria ? { categoryId: categoria } : {}),
  };

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { order: "asc" }, take: 1 },
        category: true,
        variants: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const hasFilters = Boolean(query || categoria);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900">Productos</h1>
        <Link href="/admin/productos/nuevo">
          <Button>Nuevo producto</Button>
        </Link>
      </div>

      <ProductFilters
        categories={categories}
        initialQuery={q ?? ""}
        initialCategoryId={categoria ?? ""}
      />

      {products.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">
          {hasFilters
            ? "No hay productos que coincidan con ese filtro."
            : "Todavía no cargaste productos."}
        </p>
      ) : (
        <ProductsTable products={products} />
      )}
    </div>
  );
}
