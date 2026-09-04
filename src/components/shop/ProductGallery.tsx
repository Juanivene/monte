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
      <div className="bg-bone-dark text-ink-muted flex aspect-4/5 items-center justify-center text-xs">
        Sin imagen
      </div>
    );
  }

  const go = (next: number) => setActive((next + images.length) % images.length);

  return (
    <div className="flex flex-col gap-3 lg:flex-row-reverse lg:gap-4">
      {/* Imagen principal */}
      <div className="group bg-bone-dark relative aspect-4/5 flex-1 overflow-hidden">
        {images.map((img, i) => (
          <Image
            key={img.url}
            src={img.url}
            alt={i === active ? alt : ""}
            aria-hidden={i !== active}
            fill
            loading={i === 0 ? "eager" : "lazy"}
            fetchPriority={i === 0 ? "high" : undefined}
            sizes="(min-width: 1024px) 46vw, 100vw"
            className={`object-cover transition-opacity duration-500 ease-out ${
              i === active ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        {images.length > 1 && (
          <>
            <GalleryArrow direction="prev" onClick={() => go(active - 1)} />
            <GalleryArrow direction="next" onClick={() => go(active + 1)} />
            <span className="eyebrow bg-bone/85 text-ink absolute bottom-3 right-3 px-2 py-1 text-[0.55rem] tabular-nums backdrop-blur-sm">
              {String(active + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
            </span>
          </>
        )}
      </div>

      {/* Miniaturas */}
      {images.length > 1 && (
        <div className="scrollbar-none flex gap-2 overflow-x-auto lg:w-20 lg:flex-col lg:overflow-visible">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ver imagen ${i + 1}`}
              aria-pressed={i === active}
              className={`bg-bone-dark relative aspect-4/5 w-16 shrink-0 overflow-hidden transition-opacity lg:w-full ${
                i === active ? "opacity-100" : "opacity-55 hover:opacity-100"
              }`}
            >
              <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
              <span
                className={`bg-ink absolute inset-x-0 bottom-0 h-0.5 origin-left transition-transform duration-300 ${
                  i === active ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function GalleryArrow({
  direction,
  onClick,
}: {
  direction: "prev" | "next";
  onClick: () => void;
}) {
  const isPrev = direction === "prev";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isPrev ? "Imagen anterior" : "Imagen siguiente"}
      className={`bg-bone/85 text-ink absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center opacity-0 backdrop-blur-sm transition-opacity duration-300 hover:bg-white focus-visible:opacity-100 group-hover:opacity-100 ${
        isPrev ? "left-3" : "right-3"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
        className={`h-4 w-4 ${isPrev ? "rotate-180" : ""}`}
      >
        <path d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}
