"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { confirmToast } from "@/lib/confirm-toast";
import { deleteProduct } from "@/server/actions/products";
import { TrashIcon } from "./TrashIcon";

/**
 * `iconOnly`: versión compacta (tacho) para las filas de ProductsTable — se
 * queda en la lista y solo la refresca, en vez de volver a /admin/productos.
 */
export function DeleteProductButton({
  productId,
  productName,
  iconOnly = false,
}: {
  productId: string;
  productName?: string;
  iconOnly?: boolean;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    const label = productName ? `"${productName}"` : "este producto";
    if (!(await confirmToast(`¿Eliminar ${label}? Esta acción no se puede deshacer.`))) return;
    setDeleting(true);
    const result = await deleteProduct(productId);
    setDeleting(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success("Producto eliminado.");
    if (!iconOnly) router.push("/admin/productos");
    router.refresh();
  }

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        aria-label={productName ? `Eliminar ${productName}` : "Eliminar producto"}
        title="Eliminar"
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-neutral-500 hover:bg-red-50 active:bg-red-50 hover:text-red-600 disabled:opacity-40"
      >
        <TrashIcon />
      </button>
    );
  }

  return (
    <Button type="button" variant="danger" onClick={handleDelete} disabled={deleting}>
      {deleting ? "Eliminando..." : "Eliminar producto"}
    </Button>
  );
}
