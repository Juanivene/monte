import Link from "next/link";
import { getDictionary, localePath, type Locale } from "@/i18n";
import { resolveActiveCategory, type CategoryNode } from "@/lib/categories";

export function CategoryFilter({
  lang,
  categories,
  active,
  total,
}: {
  lang: Locale;
  categories: CategoryNode[];
  active?: string;
  total: number;
}) {
  const t = getDictionary(lang);
  const current = resolveActiveCategory(categories, active);
  // la fila de subcategorías aparece al elegir una categoría (o una de sus subcategorías)
  const subcategories = current?.parent.children ?? [];
  return (
    <>
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
            active={current?.parent.slug === category.slug}
          >
            {category.name}
          </FilterLink>
        ))}
      </div>

      <p className="eyebrow text-ink-muted hidden shrink-0 pb-4 tabular-nums sm:block">
        {t.catalog.items(total)}
      </p>
    </div>

    {current && subcategories.length > 0 && (
      <div
        key={current.parent.slug}
        aria-label={current.parent.name}
        className="scrollbar-none animate-rise -mx-5 flex gap-2 overflow-x-auto px-5 pt-4 sm:mx-0 sm:px-0"
      >
        <SubLink
          href={localePath(lang, `/?categoria=${current.parent.slug}#catalogo`)}
          active={!current.sub}
        >
          {t.header.all}
        </SubLink>
        {subcategories.map((sub) => (
          <SubLink
            key={sub.slug}
            href={localePath(lang, `/?categoria=${sub.slug}#catalogo`)}
            active={current.sub?.slug === sub.slug}
          >
            {sub.name}
          </SubLink>
        ))}
      </div>
    )}
    </>
  );
}

function SubLink({
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
      className={`eyebrow shrink-0 whitespace-nowrap border px-4 py-2.5 transition-colors ${
        active
          ? "border-ink bg-ink text-bone"
          : "border-ink/15 text-ink-muted hover:border-ink hover:text-ink"
      }`}
    >
      {children}
    </Link>
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
