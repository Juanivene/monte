"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Input, Select } from "@/components/ui/Field";
import {
  DEFAULT_PRODUCT_SORT,
  PRODUCT_SORT_OPTIONS,
  PRODUCT_STATUS_OPTIONS,
  type ProductSort,
  type ProductStatusFilter,
} from "@/lib/product-filters";

const SEARCH_DEBOUNCE_MS = 350;

type Filters = {
  query: string;
  categoryId: string;
  status: ProductStatusFilter;
  sort: ProductSort;
};

export function ProductFilters({
  categories,
  initialQuery,
  initialCategoryId,
  initialStatus,
  initialSort,
}: {
  categories: { id: string; name: string }[];
  initialQuery: string;
  initialCategoryId: string;
  initialStatus: ProductStatusFilter;
  initialSort: ProductSort;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [filters, setFilters] = useState<Filters>({
    query: initialQuery,
    categoryId: initialCategoryId,
    status: initialStatus,
    sort: initialSort,
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // El filtrado corre en el servidor (prisma.product.findMany con where):
  // acá solo armamos la URL, nunca se trae todo el catálogo para filtrarlo acá.
  function applyFilters(next: Filters) {
    const params = new URLSearchParams();
    if (next.query.trim()) params.set("q", next.query.trim());
    if (next.categoryId) params.set("categoria", next.categoryId);
    if (next.status) params.set("estado", next.status);
    if (next.sort !== DEFAULT_PRODUCT_SORT) params.set("orden", next.sort);
    const qs = params.toString();

    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  }

  function handleQueryChange(value: string) {
    const next = { ...filters, query: value };
    setFilters(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => applyFilters(next), SEARCH_DEBOUNCE_MS);
  }

  function handleChange(patch: Partial<Filters>) {
    const next = { ...filters, ...patch };
    setFilters(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    applyFilters(next);
  }

  function clearFilters() {
    handleChange({ query: "", categoryId: "", status: "", sort: DEFAULT_PRODUCT_SORT });
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Cuántos filtros del desplegable están aplicados (la búsqueda queda siempre a la vista).
  const panelFilterCount =
    Number(filters.categoryId !== "") +
    Number(filters.status !== "") +
    Number(filters.sort !== DEFAULT_PRODUCT_SORT);
  const hasFilters = filters.query.trim() !== "" || panelFilterCount > 0;

  return (
    <div className="mt-4">
      {/* Teléfono: búsqueda + botón "Filtros" que despliega el resto.
          Tablet: dos filas de a dos. Escritorio: todo en una fila.
          Desde sm los wrappers son `contents`, así sus hijos entran directo en la grilla. */}
      <div className="sm:grid sm:grid-cols-2 sm:gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="flex gap-2 sm:contents">
          <Input
            type="search"
            value={filters.query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Buscar por nombre..."
            aria-label="Buscar productos por nombre"
            className="min-w-0 flex-1"
          />
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            aria-expanded={filtersOpen}
            aria-controls="product-filters-panel"
            className={`inline-flex shrink-0 items-center gap-2 rounded-xs border px-3.5 text-sm text-ink transition-colors sm:hidden ${
              filtersOpen ? "border-ink bg-sand" : "border-ink/15 bg-bone-dark/50"
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
              <path d="M4 6h16M7 12h10M10 18h4" />
            </svg>
            Filtros
            {panelFilterCount > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1.5 text-xs text-bone">
                {panelFilterCount}
              </span>
            )}
            <svg
              viewBox="0 0 24 24"
              className={`h-4 w-4 transition-transform ${filtersOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>
        <div
          id="product-filters-panel"
          className={`${filtersOpen ? "mt-3 grid" : "hidden"} grid-cols-2 gap-3 sm:contents`}
        >
          <Select
            value={filters.categoryId}
            onChange={(e) => handleChange({ categoryId: e.target.value })}
            aria-label="Filtrar por categoría"
            className="col-span-2 w-full sm:col-span-1"
          >
            <option value="">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
          <Select
            value={filters.status}
            onChange={(e) => handleChange({ status: e.target.value as ProductStatusFilter })}
            aria-label="Filtrar por estado"
            className="w-full min-w-0"
          >
            {PRODUCT_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Select
            value={filters.sort}
            onChange={(e) => handleChange({ sort: e.target.value as ProductSort })}
            aria-label="Ordenar productos"
            className="w-full min-w-0"
          >
            {PRODUCT_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>
      {(hasFilters || isPending) && (
        <div className="mt-2 flex items-center gap-3">
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex min-h-10 items-center text-sm text-neutral-500 hover:text-neutral-900"
            >
              Limpiar filtros
            </button>
          )}
          {isPending && (
            <span className="text-xs text-neutral-400">Buscando...</span>
          )}
        </div>
      )}
    </div>
  );
}
