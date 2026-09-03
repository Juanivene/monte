import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/shop/ProductCard";
import { CategoryFilter } from "@/components/shop/CategoryFilter";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;

  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: {
        isActive: true,
        ...(categoria ? { category: { slug: categoria } } : {}),
      },
      include: {
        images: { orderBy: { order: "asc" }, take: 1 },
        variants: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <CategoryFilter categories={categories} active={categoria} />

      {products.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="Todavía no hay productos"
            description="Muy pronto vamos a subir la primera colección."
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
