"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/Field";
import { updateOrderStatus } from "@/server/actions/orders";

const STATUSES = ["PENDIENTE", "CONFIRMADO", "ENVIADO", "ENTREGADO", "CANCELADO"];

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter();
  const [current, setCurrent] = useState(status);
  const [saving, setSaving] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    setCurrent(next);
    setSaving(true);
    await updateOrderStatus(orderId, next);
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={current} onChange={handleChange} disabled={saving} className="w-auto">
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </Select>
      {saving && <span className="text-xs text-neutral-400">Guardando...</span>}
    </div>
  );
}
