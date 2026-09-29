import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/money";
import { DeleteProductButton } from "./DeleteProductButton";

export type ProductRow = {
  id: string;
  name: string;
  colorName: string | null;
  price: number | string | { toString(): string };
  isActive: boolean;
  category: { name: string } | null;
  images: { url: string }[];
  variants: { stock: number }[];
};

function StatusBadge({ isActive }: { isActive: boolean }) {
  return isActive ? (
    <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">Activo</span>
  ) : (
    <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-600">Oculto</span>
  );
}

/**
 * Igual que OrdersTable: tabla real desde `sm`, lista de tarjetas apiladas
 * por debajo — mismos datos en los dos layouts, sin scroll horizontal ni
 * columnas ocultas en mobile.
 */
export function ProductsTable({ products }: { products: ProductRow[] }) {
  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-neutral-200 bg-white">
      <div className="hidden overflow-x-auto sm:block">
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
                        <Image
                          src={p.images[0].url}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
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
                    <StatusBadge isActive={p.isActive} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/productos/${p.id}`}
                        className="text-sm font-medium text-neutral-900 hover:underline"
                      >
                        Editar
                      </Link>
                      <DeleteProductButton productId={p.id} productName={p.name} iconOnly />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-neutral-200 sm:hidden">
        {products.map((p) => {
          const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
          return (
            <li key={p.id} className="flex items-center gap-1 pr-1.5 active:bg-neutral-50">
              <Link
                href={`/admin/productos/${p.id}`}
                aria-label={`Editar ${p.name}`}
                className="flex min-w-0 flex-1 items-center gap-3 py-3 pl-4"
              >
                <div className="relative h-16 w-13 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                  {p.images[0] && (
                    <Image src={p.images[0].url} alt="" fill sizes="52px" className="object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-neutral-900">
                    {p.name}
                    {p.colorName ? ` · ${p.colorName}` : ""}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-neutral-500">
                    {p.category?.name ?? "Sin categoría"}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                    <span className="font-semibold text-neutral-900 tabular-nums">
                      {formatPrice(p.price)}
                    </span>
                    <span className={totalStock === 0 ? "font-medium text-red-600" : "text-neutral-500"}>
                      {totalStock === 0 ? "Sin stock" : `Stock ${totalStock}`}
                    </span>
                    <StatusBadge isActive={p.isActive} />
                  </div>
                </div>
              </Link>
              <DeleteProductButton productId={p.id} productName={p.name} iconOnly />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
