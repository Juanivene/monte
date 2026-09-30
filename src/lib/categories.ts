import { pick, type Locale } from "@/i18n";

/** Fila de Category tal como sale de la base. Un solo nivel de subcategorías. */
export type CategoryRow = {
  id: string;
  name: string;
  nameEn: string | null;
  slug: string;
  parentId: string | null;
};

export type CategoryNode = {
  id: string;
  slug: string;
  name: string;
  children: { id: string; slug: string; name: string }[];
};

/** Categorías principales con sus subcategorías, con el nombre en el idioma pedido. */
export function buildCategoryTree(rows: CategoryRow[], lang: Locale): CategoryNode[] {
  const localized = (c: CategoryRow) => ({
    id: c.id,
    slug: c.slug,
    name: pick(lang, c.name, c.nameEn),
  });
  return rows
    .filter((c) => !c.parentId)
    .map((parent) => ({
      ...localized(parent),
      children: rows.filter((c) => c.parentId === parent.id).map(localized),
    }));
}

/**
 * Qué categoría está activa según ?categoria=slug (sirve el slug de una
 * categoría o de una subcategoría). `ids` son las categorías cuyos productos
 * se listan: elegir una categoría incluye los productos de sus subcategorías.
 */
export function resolveActiveCategory(tree: CategoryNode[], slug: string | undefined) {
  if (!slug) return null;
  for (const parent of tree) {
    if (parent.slug === slug) {
      return {
        parent,
        sub: null,
        current: parent,
        ids: [parent.id, ...parent.children.map((c) => c.id)],
      };
    }
    const sub = parent.children.find((c) => c.slug === slug);
    if (sub) return { parent, sub, current: sub, ids: [sub.id] };
  }
  return null;
}

/** Ids de una categoría más los de sus subcategorías (filtro del admin). */
export function categoryScopeIds(rows: CategoryRow[], id: string): string[] {
  return [id, ...rows.filter((c) => c.parentId === id).map((c) => c.id)];
}

/**
 * Lista plana para los <select> del admin: cada categoría seguida de sus
 * subcategorías, indentadas.
 */
export function flattenForSelect(rows: { id: string; name: string; parentId: string | null }[]) {
  const sorted = [...rows].sort((a, b) => a.name.localeCompare(b.name));
  return sorted
    .filter((c) => !c.parentId)
    .flatMap((parent) => [
      { id: parent.id, label: parent.name },
      ...sorted
        .filter((c) => c.parentId === parent.id)
        .map((c) => ({ id: c.id, label: `   ↳ ${c.name}` })),
    ]);
}
