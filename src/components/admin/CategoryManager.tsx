"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Field";
import { confirmToast } from "@/lib/confirm-toast";
import { createCategory, updateCategory, deleteCategory } from "@/server/actions/categories";

type Category = { id: string; name: string; slug: string };

export function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await createCategory({ name });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      toast.error(result.error);
      return;
    }
    toast.success("Categoría creada.");
    setName("");
    router.refresh();
  }

  async function handleUpdate(id: string) {
    if (!(await confirmToast("¿Guardar los cambios de esta categoría?"))) return;
    const result = await updateCategory(id, { name: editingName });
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
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="flex items-end gap-3">
        <div className="flex-1">
          <Label htmlFor="new-category">Nueva categoría</Label>
          <Input
            id="new-category"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Remeras"
          />
        </div>
        <Button type="submit" disabled={submitting || !name.trim()}>
          Agregar
        </Button>
      </form>
      <FieldError message={error ?? undefined} />

      <ul className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
        {initialCategories.length === 0 && (
          <li className="px-4 py-6 text-sm text-neutral-500">
            Todavía no creaste ninguna categoría.
          </li>
        )}
        {initialCategories.map((cat) => (
          <li key={cat.id} className="flex items-center justify-between gap-3 px-4 py-3">
            {editingId === cat.id ? (
              <>
                <Input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="max-w-xs"
                />
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={() => setEditingId(null)}>
                    Cancelar
                  </Button>
                  <Button type="button" onClick={() => handleUpdate(cat.id)}>
                    Guardar
                  </Button>
                </div>
              </>
            ) : (
              <>
                <span className="text-sm text-neutral-800">{cat.name}</span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setEditingId(cat.id);
                      setEditingName(cat.name);
                    }}
                  >
                    Editar
                  </Button>
                  <Button type="button" variant="danger" onClick={() => handleDelete(cat.id)}>
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
