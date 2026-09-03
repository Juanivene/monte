"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { upload } from "@vercel/blob/client";

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
        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/blob/upload",
        });
        uploaded.push(blob.url);
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
      <div className="flex flex-wrap gap-3">
        {images.map((url, index) => (
          <div
            key={url}
            className="group relative h-24 w-24 overflow-hidden rounded-lg border border-neutral-200"
          >
            <Image src={url} alt="" fill sizes="96px" className="object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/50 px-1 py-0.5 opacity-0 transition group-hover:opacity-100">
              <button
                type="button"
                onClick={() => moveTo(index, -1)}
                className="px-1 text-xs text-white"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => removeAt(index)}
                className="px-1 text-xs text-white"
              >
                ✕
              </button>
              <button
                type="button"
                onClick={() => moveTo(index, 1)}
                className="px-1 text-xs text-white"
              >
                →
              </button>
            </div>
            {index === 0 && (
              <span className="absolute left-1 top-1 rounded bg-white/90 px-1 text-[10px] font-medium">
                Portada
              </span>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading || images.length >= 10}
          className="flex h-24 w-24 flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 text-xs text-neutral-500 hover:border-neutral-500 disabled:opacity-50"
        >
          {uploading ? "Subiendo..." : "+ Agregar"}
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
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
