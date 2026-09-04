/** Acordeón sin JS: usa <details>, así funciona igual antes de hidratar. */
export function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen} className="group border-ink/12 border-b">
      <summary className="marker:content-none [&::-webkit-details-marker]:hidden flex cursor-pointer list-none items-center justify-between gap-4 py-4 select-none">
        <span className="eyebrow text-ink">{title}</span>
        <span className="text-ink-muted relative h-3 w-3 shrink-0">
          <span className="bg-ink-muted absolute left-0 top-1/2 h-px w-full -translate-y-1/2" />
          <span className="bg-ink-muted absolute left-1/2 top-0 h-full w-px -translate-x-1/2 transition-transform duration-300 group-open:scale-y-0" />
        </span>
      </summary>
      <div className="text-ink-soft pb-5 text-sm leading-relaxed">{children}</div>
    </details>
  );
}
