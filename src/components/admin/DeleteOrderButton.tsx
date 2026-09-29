"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { confirmToast } from "@/lib/confirm-toast";
import { deleteOrder } from "@/server/actions/orders";
import { TrashIcon } from "./TrashIcon";

/**
 * Tacho para las filas de OrdersTable. Si el pedido no se puede borrar
 * (`disabledReason`, ver canDeleteOrder), queda con aria-disabled en vez de
 * `disabled` — así sigue recibiendo hover/foco y muestra el tooltip con el
 * motivo; en mobile (sin hover) el tap muestra el motivo en un toast.
 */
export function DeleteOrderButton({
  orderId,
  orderLabel,
  disabledReason,
}: {
  orderId: string;
  orderLabel: string;
  disabledReason?: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const disabled = Boolean(disabledReason) || deleting;

  async function handleClick() {
    if (disabledReason) {
      toast.info(`No se puede eliminar el pedido ${orderLabel}. ${disabledReason}`);
      return;
    }
    if (deleting) return;
    if (
      !(await confirmToast(`¿Eliminar el pedido ${orderLabel}? Esta acción no se puede deshacer.`))
    )
      return;

    setDeleting(true);
    const result = await deleteOrder(orderId);
    setDeleting(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success("Pedido eliminado.");
    router.refresh();
  }

  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        onClick={handleClick}
        aria-disabled={disabled}
        aria-label={
          disabledReason
            ? `No se puede eliminar el pedido ${orderLabel}: ${disabledReason}`
            : `Eliminar pedido ${orderLabel}`
        }
        className={
          disabled
            ? "inline-flex h-10 w-10 shrink-0 cursor-not-allowed items-center justify-center rounded-lg text-neutral-300"
            : "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-neutral-500 hover:bg-red-50 active:bg-red-50 hover:text-red-600"
        }
      >
        <TrashIcon />
      </button>
      {disabledReason && (
        <span
          role="tooltip"
          className="pointer-events-none absolute right-full top-1/2 z-10 mr-2 hidden w-56 -translate-y-1/2 rounded-md bg-neutral-900 px-2.5 py-1.5 text-left text-xs font-normal normal-case text-white shadow-lg group-hover:block group-focus-within:block"
        >
          {disabledReason}
        </span>
      )}
    </span>
  );
}
