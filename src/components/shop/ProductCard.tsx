import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/money";
import { SIZES } from "@/types";
import { getDictionary, localePath, pick, type Locale } from "@/i18n";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  nameEn?: string | null;
  price: number | string | { toString(): string };
  colorName: string | null;
  colorNameEn?: string | null;
  /** la primera es la portada; si hay una segunda, se usa para el hover */
  images: { url: string }[];
  variants: { size: string; stock: number }[];
};

export function ProductCard({
  lang,
  product,
  eager = false,
}: {
  lang: Locale;
  product: ProductCardData;
  /** carga inmediata: solo para las cards que caen arriba del pliegue */
  eager?: boolean;
}) {
  const t = getDictionary(lang);
  const name = pick(lang, product.name, product.nameEn);
  const colorName = pick(lang, product.colorName, product.colorNameEn);
  const [cover, hover] = product.images;
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  const availableSizes = SIZES.filter((size) =>
    product.variants.some((v) => v.size === size && v.stock > 0),
  );

  return (
    <Link href={localePath(lang, `/productos/${product.slug}`)} className="group block">
      <div className="bg-bone-dark relative aspect-3/4 overflow-hidden">
        {cover ? (
          <>
            <Image
              src={cover.url}
              alt={name}
              fill
              loading={eager ? "eager" : "lazy"}
              sizes="(min-width: 1280px) 22vw, (min-width: 640px) 33vw, 50vw"
              className={`object-cover transition-[transform,opacity] duration-700 ease-out ${
                hover ? "group-hover:opacity-0" : "group-hover:scale-105"
              }`}
            />
            {hover && (
              <Image
                src={hover.url}
                alt=""
                aria-hidden="true"
                fill
                sizes="(min-width: 1280px) 22vw, (min-width: 640px) 33vw, 50vw"
                className="scale-105 object-cover opacity-0 transition-[transform,opacity] duration-700 ease-out group-hover:scale-100 group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <div className="text-ink-muted flex h-full items-center justify-center text-xs">
            {t.card.noImage}
          </div>
        )}

        {totalStock === 0 ? (
          <Badge>{t.card.soldOut}</Badge>
        ) : totalStock <= 3 ? (
          <Badge>{t.card.lastUnits}</Badge>
        ) : null}

        {/* Barra que sube en hover con los talles disponibles */}
        <div className="bg-bone/92 pointer-events-none absolute inset-x-0 bottom-0 translate-y-full px-3 py-2.5 backdrop-blur-sm transition-transform duration-400 ease-out group-hover:translate-y-0">
          <p className="eyebrow text-ink-muted flex items-center justify-between gap-3">
            <span className="truncate">
              {availableSizes.length > 0 ? availableSizes.join("  ") : t.card.noSizes}
            </span>
            <span className="text-ink shrink-0">{t.card.view}</span>
          </p>
        </div>
      </div>

      <div className="mt-3.5 flex items-baseline justify-between gap-3">
        <p className="text-ink line-clamp-2 text-[0.9rem] font-medium">{name}</p>
        <p className="text-ink shrink-0 text-[0.9rem] tabular-nums">
          {formatPrice(product.price, lang)}
        </p>
      </div>
      {colorName && (
        <p className="text-ink-muted mt-0.5 text-xs">{colorName}</p>
      )}
    </Link>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="eyebrow bg-bone/90 text-ink absolute left-3 top-3 px-2 py-1 text-[0.55rem] backdrop-blur-sm">
      {children}
    </span>
  );
}
