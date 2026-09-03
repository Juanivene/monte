import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/money";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  price: number | string | { toString(): string };
  colorName: string | null;
  images: { url: string }[];
  variants: { size: string; stock: number }[];
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const cover = product.images[0]?.url;
  const hasStock = product.variants.some((v) => v.stock > 0);

  return (
    <Link href={`/productos/${product.slug}`} className="group block">
      <div className="relative aspect-3/4 overflow-hidden rounded-xl bg-neutral-100">
        {cover ? (
          <Image
            src={cover}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-neutral-400">
            Sin imagen
          </div>
        )}
        {!hasStock && (
          <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-neutral-700">
            Sin stock
          </span>
        )}
      </div>
      <div className="mt-3 space-y-0.5">
        <p className="text-sm font-medium text-neutral-900">
          {product.name}
          {product.colorName ? ` · ${product.colorName}` : ""}
        </p>
        <p className="text-sm text-neutral-500">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}
