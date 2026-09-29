"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input, FieldError } from "@/components/ui/Field";
import { confirmToast } from "@/lib/confirm-toast";
import { IconButton, PencilIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from "./IconButton";
import { createLegend, updateLegendText, deleteLegend, moveLegend } from "@/server/actions/legends";
import type { LegendGroup } from "@prisma/client";

type Legend = { id: string; text: string; textEn: string | null; order: number };

export function LegendManager({
  group,
  title,
  description,
  initialLegends,
}: {
  group: LegendGroup;
  title: string;
  description?: string;
  initialLegends: Legend[];
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [textEn, setTextEn] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [editingTextEn, setEditingTextEn] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await createLegend({ group, text, textEn });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      toast.error(result.error);
      return;
    }
    toast.success("Leyenda agregada.");
    setText("");
    setTextEn("");
    router.refresh();
  }

  async function handleUpdate(id: string) {
    const result = await updateLegendText(id, { text: editingText, textEn: editingTextEn });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Leyenda actualizada.");
    setEditingId(null);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!(await confirmToast("¿Eliminar esta leyenda?"))) return;
    const result = await deleteLegend(id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Leyenda eliminada.");
    router.refresh();
  }

  async function handleMove(id: string, direction: "up" | "down") {
    const result = await moveLegend(id, direction);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
      {description && <p className="mt-1 text-xs text-neutral-500">{description}</p>}

      <form onSubmit={handleCreate} className="mt-4 space-y-2">
        <div className="flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ej: Envíos a todo el país"
            aria-label="Nueva leyenda"
            maxLength={120}
            enterKeyHint="next"
            className="min-w-0 flex-1"
          />
          <Button type="submit" disabled={submitting || !text.trim()} className="shrink-0">
            Agregar
          </Button>
        </div>
        <Input
          value={textEn}
          onChange={(e) => setTextEn(e.target.value)}
          placeholder="En inglés (opcional). Ej: Nationwide shipping"
          aria-label="Nueva leyenda en inglés"
          maxLength={120}
          lang="en"
          enterKeyHint="done"
        />
      </form>
      <FieldError message={error ?? undefined} />

      <ul className="mt-4 divide-y divide-neutral-200 rounded-lg border border-neutral-200">
        {initialLegends.length === 0 && (
          <li className="px-4 py-6 text-sm text-neutral-500">
            Todavía no cargaste ninguna leyenda.
          </li>
        )}
        {initialLegends.map((legend, index) => (
          <li key={legend.id} className="py-2 pr-1 pl-3 sm:pl-4">
            {editingId === legend.id ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdate(legend.id);
                }}
                className="flex flex-col gap-2 py-1.5 pr-2 sm:flex-row sm:items-center"
              >
                <Input
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  aria-label="Texto de la leyenda"
                  maxLength={120}
                  autoFocus
                  enterKeyHint="next"
                  className="min-w-0 sm:flex-1"
                />
                <Input
                  value={editingTextEn}
                  onChange={(e) => setEditingTextEn(e.target.value)}
                  aria-label="Texto en inglés"
                  placeholder="En inglés (opcional)"
                  maxLength={120}
                  lang="en"
                  enterKeyHint="done"
                  className="min-w-0 sm:flex-1"
                />
                <div className="grid grid-cols-2 gap-2 sm:flex">
                  <Button type="button" variant="secondary" size="sm" onClick={() => setEditingId(null)}>
                    Cancelar
                  </Button>
                  <Button type="submit" size="sm" disabled={!editingText.trim()}>
                    Guardar
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex items-center gap-2">
                {/* En teléfono tocar el texto ya abre la edición. */}
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(legend.id);
                    setEditingText(legend.text);
                    setEditingTextEn(legend.textEn ?? "");
                  }}
                  className="min-h-10 min-w-0 flex-1 text-left text-sm text-neutral-800"
                >
                  {legend.text}
                  <span className="block text-xs text-neutral-400">
                    {legend.textEn || "Sin versión en inglés (se muestra en español)"}
                  </span>
                </button>
                <div className="flex shrink-0 items-center">
                  <IconButton
                    label="Mover arriba"
                    onClick={() => handleMove(legend.id, "up")}
                    disabled={index === 0}
                  >
                    <ArrowUpIcon />
                  </IconButton>
                  <IconButton
                    label="Mover abajo"
                    onClick={() => handleMove(legend.id, "down")}
                    disabled={index === initialLegends.length - 1}
                  >
                    <ArrowDownIcon />
                  </IconButton>
                  <span className="hidden sm:contents">
                    <IconButton
                      label="Editar"
                      onClick={() => {
                        setEditingId(legend.id);
                        setEditingText(legend.text);
                        setEditingTextEn(legend.textEn ?? "");
                      }}
                    >
                      <PencilIcon />
                    </IconButton>
                  </span>
                  <IconButton label="Eliminar" tone="danger" onClick={() => handleDelete(legend.id)}>
                    <TrashIcon />
                  </IconButton>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
