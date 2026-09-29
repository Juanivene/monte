import Image from "next/image";
import type { ResolvedImage } from "@/lib/site-content/fields";

export type ContentImageProps = {
  image: ResolvedImage;
  sizes: string;
  className?: string;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
  draggable?: boolean;
};

/**
 * Foto del contenido editable. Siempre `fill`: el contenedor pone el tamaño
 * y el encuadre sale de `object-position` (x/y en %).
 */
export function ContentImage({ image, className = "", sizes, ...rest }: ContentImageProps) {
  const style = { objectPosition: `${image.x}% ${image.y}%` };

  if (typeof image.src === "string" && image.src.startsWith("blob:")) {
    // Preview local del modo mock: el optimizador de next/image no acepta blob: URLs.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image.src}
        alt={image.alt}
        draggable={rest.draggable}
        className={`absolute inset-0 h-full w-full ${className}`}
        style={style}
      />
    );
  }

  return (
    <Image
      src={image.src}
      alt={image.alt}
      // Las fotos por defecto se importan estáticas y traen su blur; las subidas no.
      placeholder={typeof image.src === "string" ? "empty" : "blur"}
      fill
      sizes={sizes}
      className={className}
      style={style}
      {...rest}
    />
  );
}
