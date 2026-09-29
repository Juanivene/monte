"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { confirmToast } from "@/lib/confirm-toast";
import {
  TEXT_FIELDS,
  resolveContent,
  sameOverrides,
  type ContentOverrides,
  type ImageField,
  type ImageOverride,
  type TextField,
} from "@/lib/site-content/fields";
import {
  discardSiteDraft,
  publishSiteContent,
  saveSiteDraft,
} from "@/server/actions/site-content";
import { SiteEditorContext, type SiteEditorApi } from "./context";
import { ImagePanel } from "./ImagePanel";

type SaveState = "saved" | "pending" | "saving" | "error";

const AUTOSAVE_DELAY = 800;

const saveLabels: Record<SaveState, string> = {
  saved: "Borrador guardado",
  pending: "Sin guardar…",
  saving: "Guardando…",
  error: "Error al guardar",
};

/**
 * Estado del editor de /admin/preview. Cada cambio se autoguarda como
 * borrador (no lo ve el cliente); "Publicar" lo pasa a la tienda.
 */
export function SiteEditorProvider({
  initialDraft,
  initialPublished,
  dbOk,
  children,
}: {
  initialDraft: ContentOverrides;
  initialPublished: ContentOverrides;
  /** false si la base no respondió al abrir: se muestra el default y se avisa. */
  dbOk: boolean;
  children: React.ReactNode;
}) {
  const [draft, setDraft] = useState(initialDraft);
  const [published, setPublished] = useState(initialPublished);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [showMarks, setShowMarks] = useState(true);
  const [activeImage, setActiveImage] = useState<ImageField | null>(null);
  const [busy, setBusy] = useState<"publish" | "discard" | null>(null);

  const draftRef = useRef(initialDraft);
  const pendingRef = useRef<ContentOverrides | null>(null);
  const timerRef = useRef<number | undefined>(undefined);
  // Cada guardado lleva un número: si vuelve la respuesta de uno viejo, se ignora.
  const saveSeqRef = useRef(0);

  const flush = useCallback(async () => {
    const next = pendingRef.current;
    if (!next) return;
    pendingRef.current = null;
    const seq = ++saveSeqRef.current;
    setSaveState("saving");

    const result = await saveSiteDraft(next).catch(() => ({
      ok: false as const,
      error: "No se pudo guardar el borrador. Revisá la conexión.",
    }));
    if (seq !== saveSeqRef.current || pendingRef.current) return;

    if (result.ok) {
      setSaveState("saved");
    } else {
      setSaveState("error");
      toast.error(result.error);
    }
  }, []);

  const applyDraft = useCallback(
    (update: (current: ContentOverrides) => ContentOverrides) => {
      const next = update(draftRef.current);
      draftRef.current = next;
      setDraft(next);
      pendingRef.current = next;
      setSaveState("pending");
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(flush, AUTOSAVE_DELAY);
    },
    [flush],
  );

  /** Corta cualquier autoguardado pendiente o en vuelo (antes de publicar o descartar). */
  function cancelAutosave() {
    window.clearTimeout(timerRef.current);
    pendingRef.current = null;
    saveSeqRef.current++;
  }

  // Avisar antes de cerrar la pestaña con cambios sin guardar.
  useEffect(() => {
    if (saveState === "saved") return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [saveState]);

  const content = useMemo(() => resolveContent(draft), [draft]);
  const dirty = !sameOverrides(draft, published);

  const api = useMemo<SiteEditorApi>(
    () => ({
      content,
      showMarks,
      isTextOverridden: (field) => draft.text?.[field] !== undefined,
      isImageOverridden: (field) => draft.image?.[field] !== undefined,
      setText: (field: TextField, value: string) =>
        applyDraft((current) => {
          const text = { ...current.text };
          // Si vuelve al valor original, no hace falta guardarlo.
          if (value === TEXT_FIELDS[field].default) delete text[field];
          else text[field] = value;
          return { ...current, text };
        }),
      resetText: (field) =>
        applyDraft((current) => {
          const text = { ...current.text };
          delete text[field];
          return { ...current, text };
        }),
      updateImage: (field: ImageField, patch: ImageOverride) =>
        applyDraft((current) => ({
          ...current,
          image: { ...current.image, [field]: { ...current.image?.[field], ...patch } },
        })),
      resetImage: (field) =>
        applyDraft((current) => {
          const image = { ...current.image };
          delete image[field];
          return { ...current, image };
        }),
      openImage: setActiveImage,
    }),
    [content, showMarks, draft, applyDraft],
  );

  async function publish() {
    cancelAutosave();
    const snapshot = draftRef.current;
    setBusy("publish");
    const result = await publishSiteContent(snapshot).catch(() => ({
      ok: false as const,
      error: "No se pudo publicar. Revisá la conexión.",
    }));
    setBusy(null);

    if (result.ok) {
      setPublished(snapshot);
      // Si se siguió editando mientras publicaba, eso queda como borrador.
      if (draftRef.current !== snapshot) applyDraft((current) => current);
      else setSaveState("saved");
      toast.success("¡Publicado! La tienda ya muestra los cambios.");
    } else {
      setSaveState("error");
      toast.error(result.error);
    }
  }

  async function discard() {
    const confirmed = await confirmToast(
      "¿Descartar todos los cambios sin publicar? La preview vuelve a lo que ve el cliente.",
    );
    if (!confirmed) return;

    cancelAutosave();
    setBusy("discard");
    const result = await discardSiteDraft().catch(() => ({
      ok: false as const,
      error: "No se pudieron descartar los cambios. Revisá la conexión.",
    }));
    setBusy(null);

    if (result.ok) {
      draftRef.current = result.published;
      setDraft(result.published);
      setPublished(result.published);
      setSaveState("saved");
      setActiveImage(null);
      toast.success("Cambios descartados.");
    } else {
      setSaveState("error");
      toast.error(result.error);
    }
  }

  const closeImage = useCallback(() => setActiveImage(null), []);

  return (
    <SiteEditorContext.Provider value={api}>
      {!dbOk && (
        <div className="bg-red-700 px-4 py-2.5 text-center font-sans text-sm text-white">
          No se pudo conectar con la base de datos: estás viendo el contenido por defecto y los
          cambios no se van a poder guardar.
        </div>
      )}

      {children}

      {/* Lugar para que la barra de edición (y en teléfono, las pestañas del admin) no tapen el final del footer. */}
      <div aria-hidden="true" className="h-44 bg-night sm:h-24" />

      {activeImage && <ImagePanel field={activeImage} editor={api} onClose={closeImage} />}

      <div
        role="toolbar"
        aria-label="Edición de la home"
        className="fixed inset-x-2 bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] z-45 sm:bottom-[calc(env(safe-area-inset-bottom)+0.5rem)] mx-auto flex max-w-3xl flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl bg-neutral-900/95 px-3 py-2.5 font-sans text-sm text-white shadow-2xl backdrop-blur sm:flex-nowrap sm:px-4"
      >
        {/* En teléfono el estado ocupa su propia fila y los botones van abajo. */}
        <div className="flex min-w-0 basis-full items-center gap-2 sm:basis-auto sm:flex-1">
          <span
            aria-hidden="true"
            className={`h-2 w-2 shrink-0 rounded-full ${
              saveState === "error"
                ? "bg-red-400"
                : dirty
                  ? "bg-amber-400"
                  : "bg-emerald-400"
            }`}
          />
          <div className="min-w-0 leading-tight">
            <p className="truncate font-medium">
              {dirty ? "Cambios sin publicar" : "Todo publicado"}
            </p>
            <p className="truncate text-xs text-white/55" aria-live="polite">
              {saveLabels[saveState]}
            </p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-between gap-1.5 sm:flex-none sm:justify-end">
          <button
            type="button"
            onClick={() => setShowMarks((v) => !v)}
            aria-pressed={!showMarks}
            className="rounded-lg px-2.5 py-2 text-xs text-white/75 hover:bg-white/10 hover:text-white"
          >
            {showMarks ? "Ver como cliente" : "Mostrar edición"}
          </button>
          <button
            type="button"
            onClick={discard}
            disabled={!dirty || busy !== null}
            className="rounded-lg px-2.5 py-2 text-xs text-white/75 hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-35"
          >
            {busy === "discard" ? "Descartando…" : "Descartar"}
          </button>
          <button
            type="button"
            onClick={publish}
            disabled={!dirty || busy !== null}
            className="rounded-lg bg-white px-3.5 py-2 text-xs font-semibold text-neutral-900 hover:bg-white/90 disabled:opacity-40"
          >
            {busy === "publish" ? "Publicando…" : "Publicar"}
          </button>
        </div>
      </div>
    </SiteEditorContext.Provider>
  );
}
