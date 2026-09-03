import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/money";
import { Button } from "@/components/ui/Button";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      images: { orderBy: { order: "asc" }, take: 1 },
      category: true,
      variants: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900">Productos</h1>
        <Link href="/admin/productos/nuevo">
          <Button>Nuevo producto</Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">Todavía no cargaste productos.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3"></th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Stock total</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {products.map((p) => {
                const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
                return (
                  <tr key={p.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <div className="relative h-12 w-10 overflow-hidden rounded bg-neutral-100">
                        {p.images[0] && (
                          <Image src={p.images[0].url} alt="" fill sizes="40px" className="object-cover" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-neutral-900">
                      {p.name}
                      {p.colorName ? ` · ${p.colorName}` : ""}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{p.category?.name ?? "—"}</td>
                    <td className="px-4 py-3">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3">{totalStock}</td>
                    <td className="px-4 py-3">
                      {p.isActive ? (
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                          Activo
                        </span>
                      ) : (
                        <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-600">
                          Oculto
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/productos/${p.id}`}
                        className="text-sm font-medium text-neutral-900 hover:underline"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
