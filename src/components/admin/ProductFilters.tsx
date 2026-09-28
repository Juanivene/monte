"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Input, Select } from "@/components/ui/Field";

const SEARCH_DEBOUNCE_MS = 350;

export function ProductFilters({
  categories,
  initialQuery,
  initialCategoryId,
}: {
  categories: { id: string; name: string }[];
  initialQuery: string;
  initialCategoryId: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery);
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // El filtrado corre en el servidor (prisma.product.findMany con where):
  // acá solo armamos la URL, nunca se trae todo el catálogo para filtrarlo acá.
  function applyFilters(nextQuery: string, nextCategoryId: string) {
    const params = new URLSearchParams();
    if (nextQuery.trim()) params.set("q", nextQuery.trim());
    if (nextCategoryId) params.set("categoria", nextCategoryId);
    const qs = params.toString();

    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => applyFilters(value, categoryId),
      SEARCH_DEBOUNCE_MS,
    );
  }

  function handleCategoryChange(value: string) {
    setCategoryId(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    applyFilters(query, value);
  }

  function clearFilters() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setQuery("");
    setCategoryId("");
    applyFilters("", "");
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const hasFilters = query.trim() !== "" || categoryId !== "";

  return (
    <div className="mt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          type="search"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Buscar por nombre..."
          aria-label="Buscar productos por nombre"
          className="w-full"
        />
        <Select
          value={categoryId}
          onChange={(e) => handleCategoryChange(e.target.value)}
          aria-label="Filtrar por categoría"
          className="w-full"
        >
          <option value="">Todas las categorías</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </div>
      {(hasFilters || isPending) && (
        <div className="mt-2 flex items-center gap-3">
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm text-neutral-500 hover:text-neutral-900"
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

