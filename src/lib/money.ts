const formatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

/** Acepta number, string o Prisma.Decimal (via toString/toNumber). */
export function formatPrice(amount: number | string | { toString(): string }): string {
  const value = typeof amount === "number" ? amount : Number(amount.toString());
  return formatter.format(value);
}
