"use client";

import { useState } from "react";
import Image from "next/image";

export function ProductGallery({
  images,
  alt,
}: {
  images: { url: string }[];
  alt: string;
}) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl bg-neutral-100 text-sm text-neutral-400">
        Sin imagen
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-xl bg-neutral-100">
        <Image
          src={images[active].url}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-16 w-16 overflow-hidden rounded-lg border ${
                i === active ? "border-neutral-900" : "border-transparent"
              }`}
            >
              <Image src={img.url} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
