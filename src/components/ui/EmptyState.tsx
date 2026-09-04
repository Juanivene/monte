export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="border-ink/12 flex flex-col items-center justify-center border border-dashed px-6 py-20 text-center">
      <span className="bg-accent/70 mb-6 block h-1.5 w-1.5 rounded-full" />
      <p className="headline text-ink text-2xl sm:text-3xl">{title}</p>
      {description && (
        <p className="text-ink-muted mt-3 max-w-sm text-sm leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}
