import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProductFilters } from "@/components/admin/ProductFilters";
import { ProductsTable } from "@/components/admin/ProductsTable";
import { Pagination } from "@/components/admin/Pagination";
import { categoryScopeIds } from "@/lib/categories";
import { pageRange, parsePage, redirectIfPageOutOfRange } from "@/lib/pagination";
import {
  PRODUCT_SORT_ORDER_BY,
  parseProductSort,
  parseProductStatus,
} from "@/lib/product-filters";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string; estado?: string; orden?: string; pagina?: string }>;
}) {
  const params = await searchParams;
  const { q, categoria, estado, orden } = params;
  const page = parsePage(params.pagina);
  const query = q?.trim();
  const status = parseProductStatus(estado);
  const sort = parseProductSort(orden);

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  // El filtrado se resuelve acá, en el where de la consulta: nunca se trae
  // todo el catálogo al front para filtrarlo ahí. Filtrar por una categoría
  // incluye los productos de sus subcategorías.
  const where: Prisma.ProductWhereInput = {
    ...(query ? { name: { contains: query, mode: "insensitive" } } : {}),
    ...(categoria ? { categoryId: { in: categoryScopeIds(categories, categoria) } } : {}),
    ...(status ? { isActive: status === "activos" } : {}),
  };

  // Solo se trae la página pedida; el count (con el mismo where) arma la paginación.
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { order: "asc" }, take: 1 },
        category: { include: { parent: true } },
        variants: true,
      },
      orderBy: PRODUCT_SORT_ORDER_BY[sort],
      ...pageRange(page),
    }),
    prisma.product.count({ where }),
  ]);

  redirectIfPageOutOfRange(page, total, "/admin/productos", params);

  const hasFilters = Boolean(query || categoria || status);

  return (
    <div>
      <PageHeader
        title="Productos"
        action={
          <Link href="/admin/productos/nuevo" className="hidden sm:block">
            <Button>Nuevo producto</Button>
          </Link>
        }
      />

      {/* En teléfono, "nuevo" es un botón flotante al alcance del pulgar, sobre la barra de pestañas. */}
      <Link
        href="/admin/productos/nuevo"
        aria-label="Nuevo producto"
        className="fixed right-4 bottom-[calc(env(safe-area-inset-bottom)+5rem)] z-30 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg shadow-neutral-900/30 active:scale-95 sm:hidden"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </Link>

      <ProductFilters
        categories={categories}
        initialQuery={q ?? ""}
        initialCategoryId={categoria ?? ""}
        initialStatus={status}
        initialSort={sort}
      />

      {products.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">
          {hasFilters
            ? "No hay productos que coincidan con ese filtro."
            : "Todavía no cargaste productos."}
        </p>
      ) : (
        <>
          <ProductsTable products={products} />
          <Pagination page={page} total={total} pathname="/admin/productos" searchParams={params} />
          {/* En teléfono deja lugar para que el botón flotante no tape "Siguiente". */}
          <div aria-hidden="true" className="h-10 sm:hidden" />
        </>
      )}
    </div>
  );
}
