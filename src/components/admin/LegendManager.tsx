"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input, FieldError } from "@/components/ui/Field";
import { confirmToast } from "@/lib/confirm-toast";
import { createLegend, updateLegendText, deleteLegend, moveLegend } from "@/server/actions/legends";
import type { LegendGroup } from "@prisma/client";

type Legend = { id: string; text: string; order: number };

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
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await createLegend({ group, text });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      toast.error(result.error);
      return;
    }
    toast.success("Leyenda agregada.");
    setText("");
    router.refresh();
  }

  async function handleUpdate(id: string) {
    const result = await updateLegendText(id, editingText);
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
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <h2 className="text-sm font-medium text-neutral-900">{title}</h2>
      {description && <p className="mt-1 text-xs text-neutral-500">{description}</p>}

      <form onSubmit={handleCreate} className="mt-4 flex items-end gap-3">
        <div className="flex-1">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ej: Envíos a todo el país"
            maxLength={120}
          />
        </div>
        <Button type="submit" disabled={submitting || !text.trim()}>
          Agregar
        </Button>
      </form>
      <FieldError message={error ?? undefined} />

      <ul className="mt-4 divide-y divide-neutral-200 rounded-lg border border-neutral-200">
        {initialLegends.length === 0 && (
          <li className="px-4 py-6 text-sm text-neutral-500">
            Todavía no cargaste ninguna leyenda.
          </li>
        )}
        {initialLegends.map((legend, index) => (
          <li key={legend.id} className="flex items-center justify-between gap-3 px-4 py-3">
            {editingId === legend.id ? (
              <>
                <Input
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  className="max-w-xs"
                  maxLength={120}
                />
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={() => setEditingId(null)}>
                    Cancelar
                  </Button>
                  <Button type="button" onClick={() => handleUpdate(legend.id)}>
                    Guardar
                  </Button>
                </div>
              </>
            ) : (
              <>
                <span className="text-sm text-neutral-800">{legend.text}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleMove(legend.id, "up")}
                    disabled={index === 0}
                    aria-label="Mover arriba"
                    className="px-1.5 text-sm text-neutral-500 hover:text-neutral-900 disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(legend.id, "down")}
                    disabled={index === initialLegends.length - 1}
                    aria-label="Mover abajo"
                    className="px-1.5 text-sm text-neutral-500 hover:text-neutral-900 disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setEditingId(legend.id);
                      setEditingText(legend.text);
                    }}
                  >
                    Editar
                  </Button>
                  <Button type="button" variant="danger" onClick={() => handleDelete(legend.id)}>
                    Eliminar
                  </Button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
