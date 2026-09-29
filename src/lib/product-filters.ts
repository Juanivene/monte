import type { Prisma } from "@prisma/client";

export type ProductStatusFilter = "" | "activos" | "inactivos";
export type ProductSort = "recientes" | "antiguos" | "nombre";

export const DEFAULT_PRODUCT_SORT: ProductSort = "recientes";

export const PRODUCT_STATUS_OPTIONS: { value: ProductStatusFilter; label: string }[] = [
  { value: "", label: "Todos los estados" },
  { value: "activos", label: "Activos" },
  { value: "inactivos", label: "Inactivos" },
];

export const PRODUCT_SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "recientes", label: "Más nuevos primero" },
  { value: "antiguos", label: "Más viejos primero" },
  { value: "nombre", label: "Nombre (A-Z)" },
];

export const PRODUCT_SORT_ORDER_BY: Record<ProductSort, Prisma.ProductOrderByWithRelationInput> = {
  recientes: { createdAt: "desc" },
  antiguos: { createdAt: "asc" },
  nombre: { name: "asc" },
};

// Los valores vienen de la URL: cualquier cosa desconocida cae al default.
export function parseProductStatus(value: string | undefined): ProductStatusFilter {
  return value === "activos" || value === "inactivos" ? value : "";
}

export function parseProductSort(value: string | undefined): ProductSort {
  return value && Object.hasOwn(PRODUCT_SORT_ORDER_BY, value) ? (value as ProductSort) : DEFAULT_PRODUCT_SORT;
}
