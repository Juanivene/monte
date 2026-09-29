"use client";

import { useRef, useState } from "react";
import Image from "next/image";
//todo remover
import { MOCK_MODE } from "@/lib/mock/config";

// Pide al server una URL firmada y sube el archivo directo a R2 desde el navegador.
async function uploadToR2(file: File): Promise<string> {
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType: file.type, size: file.size }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Error subiendo la imagen");

  const put = await fetch(data.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!put.ok) throw new Error("Error subiendo la imagen a R2");

  return data.publicUrl;
}

export function ImageUploader({
  images,
  onChange,
}: {
  images: string[];
  onChange: (urls: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        if (MOCK_MODE) {
          // Sin R2: preview local del archivo, nada viaja por red.
          uploaded.push(URL.createObjectURL(file));
        } else {
          uploaded.push(await uploadToR2(file));
        }
      }
      onChange([...images, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error subiendo la imagen");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  function moveTo(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div>
      {/*
        En teléfono: grilla de 3 con miniaturas grandes y los controles siempre
        visibles (no hay hover). En desktop: fila de 96px con controles al pasar el mouse.
      */}
      <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-3">
        {images.map((url, index) => (
          <div
            key={url}
            className="group relative aspect-square overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 sm:h-24 sm:w-24"
          >
            {url.startsWith("blob:") ? (
              // el optimizador de next/image no acepta blob: URLs (preview local del modo mock)
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt="" className="h-full w-full object-cover" />
            ) : (
              <Image src={url} alt="" fill sizes="(min-width: 640px) 96px, 33vw" className="object-cover" />
            )}
            <button
              type="button"
              onClick={() => removeAt(index)}
              aria-label="Quitar imagen"
              className="absolute top-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-sm text-white transition sm:opacity-0 sm:group-hover:opacity-100 [@media(hover:none)]:opacity-100"
            >
              ✕
            </button>
            <div className="absolute inset-x-0 bottom-0 flex bg-black/50 transition sm:opacity-0 sm:group-hover:opacity-100 [@media(hover:none)]:opacity-100">
              <button
                type="button"
                onClick={() => moveTo(index, -1)}
                disabled={index === 0}
                aria-label="Mover a la izquierda"
                className="h-8 flex-1 text-sm text-white disabled:opacity-30 sm:h-6 sm:text-xs"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => moveTo(index, 1)}
                disabled={index === images.length - 1}
                aria-label="Mover a la derecha"
                className="h-8 flex-1 text-sm text-white disabled:opacity-30 sm:h-6 sm:text-xs"
              >
                →
              </button>
            </div>
            {index === 0 && (
              <span className="absolute left-1 top-1 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-neutral-900">
                Portada
              </span>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading || images.length >= 10}
          className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-neutral-300 text-xs text-neutral-500 hover:border-neutral-500 active:bg-neutral-100 disabled:opacity-50 sm:h-24 sm:w-24"
        >
          <span className="text-xl leading-none">{uploading ? "…" : "+"}</span>
          {uploading ? "Subiendo..." : "Agregar fotos"}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="mt-2 text-xs text-neutral-500">
        La primera es la portada. Hasta 10 fotos.
      </p>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
