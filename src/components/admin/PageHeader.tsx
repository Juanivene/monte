import Link from "next/link";

/**
 * Encabezado de las páginas del admin: link de volver (opcional), título y
 * una acción a la derecha. En teléfono el "volver" es un área de toque
 * grande en vez de un texto chico.
 */
export function PageHeader({
  title,
  subtitle,
  back,
  action,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  back?: { href: string; label: string };
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 sm:mb-6">
      {back && (
        <Link
          href={back.href}
          className="-ml-2 mb-1 inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-sm text-neutral-500 hover:text-neutral-900 active:bg-neutral-100"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
          {back.label}
        </Link>
      )}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-xl">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
