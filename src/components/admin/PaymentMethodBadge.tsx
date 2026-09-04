const LABELS: Record<string, string> = {
  TRANSFERENCIA: "Transferencia",
  PAYPAL: "PayPal",
};

const CLASSES: Record<string, string> = {
  TRANSFERENCIA: "bg-neutral-100 text-neutral-700",
  PAYPAL: "bg-sky-100 text-sky-800",
};

export function PaymentMethodBadge({ method }: { method: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        CLASSES[method] ?? "bg-neutral-100 text-neutral-700"
      }`}
    >
      {LABELS[method] ?? method}
    </span>
  );
}
