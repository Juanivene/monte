import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProductOrderBoard } from "@/components/admin/ProductOrderBoard";

export default async function AdminProductOrderPage() {
  const products = await prisma.product.findMany({
    include: { images: { orderBy: { order: "asc" }, take: 1 } },
    // mismo orden que la tienda
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <PageHeader
        back={{ href: "/admin/productos", label: "Productos" }}
        title="Orden en la tienda"
        subtitle="Arrastrá los productos o usá las flechas. Se guarda solo y la tienda se actualiza al instante."
      />
      {products.length === 0 ? (
        <p className="text-sm text-neutral-500">Todavía no cargaste productos.</p>
      ) : (
        <ProductOrderBoard
          initialItems={products.map((p) => ({
            id: p.id,
            name: p.name,
            colorName: p.colorName,
            imageUrl: p.images[0]?.url ?? null,
            isActive: p.isActive,
          }))}
        />
      )}
    </div>
  );
}
