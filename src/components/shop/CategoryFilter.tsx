import Link from "next/link";
import { getDictionary, localePath, type Locale } from "@/i18n";

export function CategoryFilter({
  lang,
  categories,
  active,
  total,
}: {
  lang: Locale;
  categories: { slug: string; name: string }[];
  active?: string;
  total: number;
}) {
  const t = getDictionary(lang);
  return (
    <div className="border-ink/12 flex items-end justify-between gap-6 border-b">
      <div className="scrollbar-none flex gap-7 overflow-x-auto">
        {/*
          #catalogo: estos pills ya viven en esa sección, pero sin el hash
          Next igual scrollea al top de la página (el Hero) en cada click.
        */}
        <FilterLink href={localePath(lang, "/#catalogo")} active={!active}>
          {t.header.all}
        </FilterLink>
        {categories.map((category) => (
          <FilterLink
            key={category.slug}
            href={localePath(lang, `/?categoria=${category.slug}#catalogo`)}
            active={active === category.slug}
          >
            {category.name}
          </FilterLink>
        ))}
      </div>

      <p className="eyebrow text-ink-muted hidden shrink-0 pb-4 tabular-nums sm:block">
        {t.catalog.items(total)}
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
