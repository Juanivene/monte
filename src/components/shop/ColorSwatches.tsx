import Link from "next/link";
import Image from "next/image";
import { getDictionary, localePath, type Locale } from "@/i18n";

type Sibling = {
  id: string;
  slug: string;
  colorName: string | null;
  images: { url: string }[];
};

export function ColorSwatches({
  lang,
  currentColorName,
  currentImage,
  siblings,
}: {
  lang: Locale;
  currentColorName: string | null;
  currentImage?: string;
  siblings: Sibling[];
}) {
  const t = getDictionary(lang);
  return (
    <div>
      <p className="eyebrow text-ink-muted">
        {t.product.color}
        {currentColorName ? `: ${currentColorName}` : ""}
      </p>

      <div className="mt-3 flex flex-wrap gap-2.5">
        <div
          aria-current="true"
          className="ring-ink bg-bone-dark relative h-14 w-14 overflow-hidden ring-1 ring-offset-2 ring-offset-bone"
        >
          {currentImage && (
            <Image src={currentImage} alt="" fill sizes="56px" className="object-cover" />
          )}
        </div>

        {siblings.map((sibling) => (
          <Link
            key={sibling.id}
            href={localePath(lang, `/productos/${sibling.slug}`)}
            title={sibling.colorName ?? t.product.otherColor}
            className="ring-ink/0 hover:ring-ink/40 bg-bone-dark relative h-14 w-14 overflow-hidden ring-1 ring-offset-2 ring-offset-bone transition-shadow"
          >
            {sibling.images[0] && (
              <Image
                src={sibling.images[0].url}
                alt={sibling.colorName ?? ""}
                fill
                sizes="56px"
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
