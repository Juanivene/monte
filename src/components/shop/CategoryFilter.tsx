import Link from "next/link";

export function CategoryFilter({
  categories,
  active,
}: {
  categories: { slug: string; name: string }[];
  active?: string;
}) {
  if (categories.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/"
        className={`rounded-full border px-4 py-1.5 text-sm transition ${
          !active
            ? "border-neutral-900 bg-neutral-900 text-white"
            : "border-neutral-300 text-neutral-700 hover:border-neutral-500"
        }`}
      >
        Todo
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.slug}
          href={`/?categoria=${cat.slug}`}
          className={`rounded-full border px-4 py-1.5 text-sm transition ${
            active === cat.slug
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-neutral-300 text-neutral-700 hover:border-neutral-500"
          }`}
        >
          {cat.name}
        </Link>
      ))}
    </div>
  );
}
