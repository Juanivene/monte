"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { confirmToast } from "@/lib/confirm-toast";
import { deleteProduct } from "@/server/actions/products";

export function DeleteProductButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!(await confirmToast("¿Eliminar este producto? Esta acción no se puede deshacer."))) return;
    setDeleting(true);
    const result = await deleteProduct(productId);
    setDeleting(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success("Producto eliminado.");
    router.push("/admin/productos");
    router.refresh();
  }

  return (
    <Button type="button" variant="danger" onClick={handleDelete} disabled={deleting}>
      {deleting ? "Eliminando..." : "Eliminar producto"}
    </Button>
  );
}
