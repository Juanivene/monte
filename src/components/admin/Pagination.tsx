import Link from "next/link";
import { ADMIN_PAGE_SIZE, pageCountFor, pageHref } from "@/lib/pagination";

type PageItem = number | "gap";

/** 1 … 4 5 6 … 12: siempre la primera, la última y las vecinas de la actual. */
function pageItems(page: number, pageCount: number): PageItem[] {
  const pages = new Set([1, pageCount, page - 1, page, page + 1]);
  // Si el hueco sería de una sola página, se muestra el número en vez de "…".
  if (page - 3 === 1) pages.add(2);
  if (page + 3 === pageCount) pages.add(pageCount - 1);

  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);
  const items: PageItem[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) items.push("gap");
    items.push(p);
  });
  return items;
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={direction === "left" ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
    </svg>
  );
}

const stepClass =
  "inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-lg border px-4 text-sm font-medium sm:h-10 sm:flex-none sm:px-3";

function StepLink({
  href,
  direction,
  label,
}: {
  href: string | null;
  direction: "left" | "right";
  label: string;
}) {
  const content = (
    <>
      {direction === "left" && <Chevron direction="left" />}
      <span>{label}</span>
      {direction === "right" && <Chevron direction="right" />}
    </>
  );

  if (!href) {
    return (
      <span aria-disabled="true" className={`${stepClass} border-neutral-200 text-neutral-300`}>
        {content}
      </span>
    );
  }
  return (
    <Link
      href={href}
      rel={direction === "left" ? "prev" : "next"}
      className={`${stepClass} border-neutral-300 bg-white text-neutral-700 hover:border-neutral-500 hover:text-neutral-900 active:bg-neutral-100`}
    >
      {content}
    </Link>
  );
}

/**
 * Paginación de las listas del admin. Todo son links (la página vive en
 * `?pagina=`), así funciona sin JS, se puede compartir y el "atrás" del
 * navegador vuelve a la página anterior. En teléfono: Anterior / "2 de 5" /
 * Siguiente con botones grandes; desde `sm` se suman los números de página.
 */
export function Pagination({
  page,
  total,
  pathname,
  searchParams,
  pageSize = ADMIN_PAGE_SIZE,
}: {
  page: number;
  total: number;
  pathname: string;
  searchParams: Record<string, string | undefined>;
  pageSize?: number;
}) {
  if (total === 0) return null;

  const pageCount = pageCountFor(total, pageSize);
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const href = (p: number) => pageHref(pathname, searchParams, p);

  return (
    <div className="mt-4 flex flex-col-reverse items-center gap-3 sm:flex-row sm:justify-between">
      <p className="text-sm text-neutral-500">
        Mostrando <span className="font-medium text-neutral-900 tabular-nums">{from}–{to}</span> de{" "}
        <span className="font-medium text-neutral-900 tabular-nums">{total}</span>
      </p>

      {pageCount > 1 && (
        <nav aria-label="Paginación" className="flex w-full items-center gap-2 sm:w-auto sm:gap-1">
          <StepLink href={page > 1 ? href(page - 1) : null} direction="left" label="Anterior" />

          <span className="shrink-0 px-2 text-sm text-neutral-600 tabular-nums sm:hidden">
            <span className="font-semibold text-neutral-900">{page}</span> de {pageCount}
          </span>

          <ul className="hidden items-center gap-1 sm:flex">
            {pageItems(page, pageCount).map((item, i) =>
              item === "gap" ? (
                <li key={`gap-${i}`} aria-hidden="true" className="w-6 text-center text-sm text-neutral-400">
                  …
                </li>
              ) : (
                <li key={item}>
                  <Link
                    href={href(item)}
                    aria-label={`Página ${item}`}
                    aria-current={item === page ? "page" : undefined}
                    className={`inline-flex h-10 min-w-10 items-center justify-center rounded-lg px-2 text-sm font-medium tabular-nums ${
                      item === page
                        ? "bg-neutral-900 text-white"
                        : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                    }`}
                  >
                    {item}
                  </Link>
                </li>
              ),
            )}
          </ul>

          <StepLink href={page < pageCount ? href(page + 1) : null} direction="right" label="Siguiente" />
        </nav>
      )}
    </div>
  );
}
