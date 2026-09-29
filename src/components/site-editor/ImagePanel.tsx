"use client";

import { useEffect, useRef, useState } from "react";
import { imageSpec, type ImageField } from "@/lib/site-content/fields";
import { uploadImage } from "@/lib/upload-image";
import { ContentImage } from "./ContentImage";
import type { SiteEditorApi } from "./context";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_SIZE = 10 * 1024 * 1024;

async function measure(file: File): Promise<{ width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const size = { width: bitmap.width, height: bitmap.height };
  bitmap.close();
  return size;
}

const round = (n: number) => Math.round(Math.min(Math.max(n, 0), 100) * 10) / 10;

/**
 * Panel lateral (hoja de abajo en el teléfono) para editar una foto: subir
 * otra, marcar el punto de encuadre y el texto alternativo. No tapa la
 * página, así el cambio se ve en vivo en su lugar.
 */
export function ImagePanel({
  field,
  editor,
  onClose,
}: {
  field: ImageField;
  editor: SiteEditorApi;
  onClose: () => void;
}) {
  const image = editor.content.image[field];
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (!ACCEPTED.includes(file.type)) return setError("Formato no permitido: usá JPG, PNG, WEBP o AVIF.");
    if (file.size > MAX_SIZE) return setError("La foto supera los 10 MB.");

    setUploading(true);
    try {
      const { width, height } = await measure(file);
      const url = await uploadImage(file, "site");
      // Foto nueva: el encuadre arranca centrado.
      editor.updateImage(field, { url, width, height, x: 50, y: 50 });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir la foto");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function onPickFocus(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    editor.updateImage(field, {
      x: round(((e.clientX - rect.left) / rect.width) * 100),
      y: round(((e.clientY - rect.top) / rect.height) * 100),
    });
  }

  const ratio = image.width / image.height;

  return (
    <aside
      aria-label={`Editar ${imageSpec(field).label}`}
      className="fixed inset-x-0 bottom-0 z-70 max-h-[75vh] overflow-y-auto rounded-t-2xl bg-white p-4 font-sans text-sm text-neutral-900 shadow-2xl sm:inset-x-auto sm:top-4 sm:right-4 sm:bottom-24 sm:max-h-none sm:w-88 sm:rounded-2xl"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{imageSpec(field).label}</p>
          <p className="mt-0.5 text-xs text-neutral-500">Los cambios se ven en vivo en la página.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="-mt-1 -mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100"
        >
          ✕
        </button>
      </div>

      <p className="mb-1.5 text-xs font-medium text-neutral-600">
        Encuadre: tocá la parte de la foto que siempre tiene que verse
      </p>
      <div
        role="button"
        tabIndex={-1}
        aria-label="Elegir punto de encuadre"
        onClick={onPickFocus}
        className="relative mx-auto cursor-crosshair overflow-hidden rounded-lg bg-neutral-100"
        style={{ aspectRatio: `${image.width} / ${image.height}`, width: `min(100%, calc(38vh * ${ratio}))` }}
      >
        {/* Mismo aspecto que la foto: se ve entera, así el click cae donde corresponde. */}
        <ContentImage image={{ ...image, x: 50, y: 50 }} sizes="22rem" draggable={false} />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-accent/70 shadow-[0_0_0_1px_rgba(0,0,0,0.4)]"
          style={{ left: `${image.x}%`, top: `${image.y}%` }}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          {uploading ? "Subiendo…" : "Subir otra foto"}
        </button>
        {editor.isImageOverridden(field) && (
          <button
            type="button"
            disabled={uploading}
            onClick={() => editor.resetImage(field)}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
          >
            Restaurar original
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      <p className="mt-1.5 text-xs text-neutral-500">JPG, PNG, WEBP o AVIF, hasta 10 MB.</p>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      <label className="mt-4 block">
        <span className="mb-1.5 block text-xs font-medium text-neutral-600">
          Descripción de la foto (la leen Google y los lectores de pantalla)
        </span>
        <textarea
          value={image.alt}
          maxLength={200}
          rows={2}
          onChange={(e) => editor.updateImage(field, { alt: e.target.value })}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
        />
      </label>

      <button
        type="button"
        onClick={onClose}
        className="mt-4 w-full rounded-lg bg-accent px-3 py-2.5 text-sm font-medium text-white hover:opacity-90"
      >
        Listo
      </button>
    </aside>
  );
}
