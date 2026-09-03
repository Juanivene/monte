"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { deleteProduct } from "@/server/actions/products";

export function DeleteProductButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("¿Eliminar este producto? Esta acción no se puede deshacer.")) return;
    setDeleting(true);
    await deleteProduct(productId);
    router.push("/admin/productos");
    router.refresh();
  }

  return (
    <Button type="button" variant="danger" onClick={handleDelete} disabled={deleting}>
      {deleting ? "Eliminando..." : "Eliminar producto"}
    </Button>
  );
}
