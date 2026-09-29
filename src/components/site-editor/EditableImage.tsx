"use client";

import type { ImageField, ResolvedImage } from "@/lib/site-content/fields";
import { ContentImage, type ContentImageProps } from "./ContentImage";
import { useSiteEditor } from "./context";

/**
 * Foto del home. En la tienda es la foto y nada más; dentro de /admin/preview
 * suma un botón para cambiarla o moverle el encuadre. El contenedor tiene que
 * ser `relative` (la foto es `fill`).
 */
export function EditableImage({
  field,
  image,
  ...props
}: { field: ImageField; image: ResolvedImage } & Omit<ContentImageProps, "image">) {
  const editor = useSiteEditor();
  if (!editor) return <ContentImage image={image} {...props} />;

  return (
    <>
      <ContentImage
        image={editor.content.image[field]}
        {...props}
        // Sin animaciones (Ken Burns) mientras se edita: se ve el encuadre real.
        className={`${props.className ?? ""} !animate-none`}
      />
      {editor.showMarks && (
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            editor.openImage(field);
          }}
          className="absolute top-2 right-2 z-20 inline-flex items-center gap-1.5 rounded-full bg-neutral-900/85 px-3 py-1.5 font-sans text-xs font-medium tracking-normal text-white normal-case shadow-lg backdrop-blur-sm hover:bg-neutral-900"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true" className="h-3.5 w-3.5">
            <path d="M4 7h3l2-3h6l2 3h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          Cambiar foto
        </button>
      )}
    </>
  );
}
