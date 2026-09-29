"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Select } from "@/components/ui/Field";
import { confirmToast } from "@/lib/confirm-toast";
import { updateOrderStatus } from "@/server/actions/orders";
import { STATUS_LABELS } from "./OrderStatusBadge";

const STATUSES = ["PENDIENTE", "CONFIRMADO", "ENVIADO", "ENTREGADO", "CANCELADO"];

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter();
  const [current, setCurrent] = useState(status);
  const [saving, setSaving] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    if (next === current) return;
    if (!(await confirmToast(`¿Cambiar el estado del pedido a "${STATUS_LABELS[next] ?? next}"?`))) {
      e.target.value = current;
      return;
    }

    setCurrent(next);
    setSaving(true);
    const result = await updateOrderStatus(orderId, next);
    setSaving(false);

    if (!result.ok) {
      setCurrent(status);
      toast.error(result.error);
      return;
    }

    toast.success("Estado del pedido actualizado.");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <Select
        value={current}
        onChange={handleChange}
        disabled={saving}
        aria-label="Estado del pedido"
        className="sm:w-auto"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s] ?? s}
          </option>
        ))}
      </Select>
      {saving && <span className="shrink-0 text-xs text-neutral-400">Guardando...</span>}
    </div>
  );
}
