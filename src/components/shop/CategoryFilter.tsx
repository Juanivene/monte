import Link from "next/link";

export function CategoryFilter({
  categories,
  active,
  total,
}: {
  categories: { slug: string; name: string }[];
  active?: string;
  total: number;
}) {
  return (
    <div className="border-ink/12 flex items-end justify-between gap-6 border-b">
      <div className="scrollbar-none flex gap-7 overflow-x-auto">
        <FilterLink href="/" active={!active}>
          Todo
        </FilterLink>
        {categories.map((category) => (
          <FilterLink
            key={category.slug}
            href={`/?categoria=${category.slug}`}
            active={active === category.slug}
          >
            {category.name}
          </FilterLink>
        ))}
      </div>

      <p className="eyebrow text-ink-muted hidden shrink-0 pb-4 tabular-nums sm:block">
        {total} {total === 1 ? "prenda" : "prendas"}
      </p>
    </div>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`eyebrow relative -mb-px shrink-0 whitespace-nowrap pb-4 transition-colors ${
        active ? "text-ink" : "text-ink-muted hover:text-ink"
      }`}
    >
      {children}
      <span
        className={`bg-ink absolute inset-x-0 bottom-0 h-px origin-left transition-transform duration-400 ease-out ${
          active ? "scale-x-100" : "scale-x-0"
        }`}
      />
    </Link>
  );
}
