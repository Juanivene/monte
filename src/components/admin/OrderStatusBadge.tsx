const STATUS_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADO: "Confirmado",
  ENVIADO: "Enviado",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

const STATUS_CLASSES: Record<string, string> = {
  PENDIENTE: "bg-amber-100 text-amber-800",
  CONFIRMADO: "bg-blue-100 text-blue-800",
  ENVIADO: "bg-indigo-100 text-indigo-800",
  ENTREGADO: "bg-green-100 text-green-800",
  CANCELADO: "bg-red-100 text-red-800",
};

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        STATUS_CLASSES[status] ?? "bg-neutral-100 text-neutral-700"
      }`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
