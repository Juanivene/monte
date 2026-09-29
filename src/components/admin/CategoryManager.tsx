"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Field";
import { confirmToast } from "@/lib/confirm-toast";
import { IconButton, PencilIcon, TrashIcon } from "./IconButton";
import { createCategory, updateCategory, deleteCategory } from "@/server/actions/categories";

type Category = { id: string; name: string; nameEn: string | null; slug: string };

export function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingNameEn, setEditingNameEn] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await createCategory({ name, nameEn });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      toast.error(result.error);
      return;
    }
    toast.success("Categoría creada.");
    setName("");
    setNameEn("");
    router.refresh();
  }

  async function handleUpdate(id: string) {
    if (!(await confirmToast("¿Guardar los cambios de esta categoría?"))) return;
    const result = await updateCategory(id, { name: editingName, nameEn: editingNameEn });
    if (!result.ok) {
      setError(result.error);
      toast.error(result.error);
      return;
    }
    toast.success("Categoría actualizada.");
    setEditingId(null);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!(await confirmToast("¿Eliminar esta categoría? Los productos quedarán sin categoría.")))
      return;
    const result = await deleteCategory(id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Categoría eliminada.");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleCreate}>
        <Label htmlFor="new-category">Nueva categoría</Label>
        <div className="flex gap-2">
          <Input
            id="new-category"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Remeras"
            autoCapitalize="sentences"
            enterKeyHint="done"
            className="min-w-0 flex-1"
          />
          <Button type="submit" disabled={submitting || !name.trim()} className="shrink-0">
            Agregar
          </Button>
        </div>
        <Input
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          placeholder="En inglés (opcional). Ej: Tees"
          aria-label="Nombre en inglés"
          lang="en"
          enterKeyHint="done"
          className="mt-2"
        />
        <FieldError message={error ?? undefined} />
      </form>

      <ul className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
        {initialCategories.length === 0 && (
          <li className="px-4 py-6 text-sm text-neutral-500">
            Todavía no creaste ninguna categoría.
          </li>
        )}
        {initialCategories.map((cat) => (
          <li key={cat.id} className="px-4 py-2">
            {editingId === cat.id ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdate(cat.id);
                }}
                className="flex flex-col gap-2 py-1.5 sm:flex-row sm:items-center"
              >
                <Input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  aria-label="Nombre de la categoría"
                  autoFocus
                  enterKeyHint="next"
                  className="min-w-0 sm:flex-1"
                />
                <Input
                  value={editingNameEn}
                  onChange={(e) => setEditingNameEn(e.target.value)}
                  aria-label="Nombre en inglés"
                  placeholder="En inglés (opcional)"
                  lang="en"
                  enterKeyHint="done"
                  className="min-w-0 sm:flex-1"
                />
                <div className="grid grid-cols-2 gap-2 sm:flex">
                  <Button type="button" variant="secondary" size="sm" onClick={() => setEditingId(null)}>
                    Cancelar
                  </Button>
                  <Button type="submit" size="sm" disabled={!editingName.trim()}>
                    Guardar
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate text-base text-neutral-800 sm:text-sm">
                  {cat.name}
                  <span className="text-neutral-400">
                    {" · "}
                    {cat.nameEn || "sin inglés"}
                  </span>
                </span>
                <div className="flex shrink-0 gap-1">
                  <IconButton
                    label={`Editar ${cat.name}`}
                    onClick={() => {
                      setEditingId(cat.id);
                      setEditingName(cat.name);
                      setEditingNameEn(cat.nameEn ?? "");
                    }}
                  >
                    <PencilIcon />
                  </IconButton>
                  <IconButton label={`Eliminar ${cat.name}`} tone="danger" onClick={() => handleDelete(cat.id)}>
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
