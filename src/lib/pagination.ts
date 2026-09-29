import { redirect } from "next/navigation";

export const ADMIN_PAGE_SIZE = 10;

type SearchParams = Record<string, string | undefined>;

/** `?pagina=` viene de la URL: cualquier cosa que no sea un entero >= 1 es la página 1. */
export function parsePage(value: string | undefined): number {
  const page = Number(value);
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

/** skip/take para la consulta de Prisma de la página pedida. */
export function pageRange(page: number, pageSize = ADMIN_PAGE_SIZE) {
  return { skip: (page - 1) * pageSize, take: pageSize };
}

export function pageCountFor(total: number, pageSize = ADMIN_PAGE_SIZE) {
  return Math.max(1, Math.ceil(total / pageSize));
}

/** Link a otra página conservando el resto de los filtros; la 1 no lleva `?pagina`. */
export function pageHref(pathname: string, params: SearchParams, page: number) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value && key !== "pagina") qs.set(key, value);
  }
  if (page > 1) qs.set("pagina", String(page));
  const query = qs.toString();
  return query ? `${pathname}?${query}` : pathname;
}

/**
 * Si la página pedida quedó fuera de rango (URL vieja, o se borró el último
 * elemento de la última página), redirige a la última que existe.
 */
export function redirectIfPageOutOfRange(
  page: number,
  total: number,
  pathname: string,
  params: SearchParams,
) {
  const pageCount = pageCountFor(total);
  if (page > pageCount) redirect(pageHref(pathname, params, pageCount));
}
