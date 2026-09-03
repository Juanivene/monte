import Link from "next/link";
import Image from "next/image";

export function ColorSwatches({
  currentColorName,
  siblings,
}: {
  currentColorName: string | null;
  siblings: { id: string; slug: string; colorName: string | null; images: { url: string }[] }[];
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-neutral-500">Colores disponibles</p>
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-col items-center gap-1">
          <div className="h-12 w-12 rounded-lg bg-neutral-100 ring-2 ring-neutral-900 ring-offset-2" />
          <span className="text-[11px] text-neutral-600">{currentColorName ?? "Actual"}</span>
        </div>
        {siblings.map((s) => (
          <Link key={s.id} href={`/productos/${s.slug}`} className="flex flex-col items-center gap-1">
            <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-neutral-200">
              {s.images[0] && (
                <Image src={s.images[0].url} alt={s.colorName ?? ""} fill sizes="48px" className="object-cover" />
              )}
            </div>
            <span className="text-[11px] text-neutral-600">{s.colorName ?? "Ver"}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
