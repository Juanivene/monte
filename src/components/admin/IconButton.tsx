import { TrashIcon } from "./TrashIcon";

/**
 * Botón cuadrado de 40px (área de toque cómoda en el teléfono) para las
 * acciones de fila: editar, borrar, mover.
 */
export function IconButton({
  label,
  tone = "neutral",
  className = "",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  tone?: "neutral" | "danger";
}) {
  const toneClass =
    tone === "danger"
      ? "text-neutral-500 hover:bg-red-50 hover:text-red-600 active:bg-red-50"
      : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-100";
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg disabled:opacity-30 disabled:hover:bg-transparent ${toneClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function StrokeIcon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export const PencilIcon = () => <StrokeIcon d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4ZM13.5 6.5l4 4" />;
export const ArrowUpIcon = () => <StrokeIcon d="M12 19V5M6 11l6-6 6 6" />;
export const ArrowDownIcon = () => <StrokeIcon d="M12 5v14M6 13l6 6 6-6" />;
export { TrashIcon };
