"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, FieldError } from "@/components/ui/Field";
import { confirmToast } from "@/lib/confirm-toast";
import { IconButton, PencilIcon, TrashIcon } from "./IconButton";
import { createCategory, updateCategory, deleteCategory } from "@/server/actions/categories";

type Category = {
  id: string;
  name: string;
  nameEn: string | null;
  slug: string;
  parentId: string | null;
};

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

export function CategoryManager({
  initialCategories,
  productCounts,
}: {
  initialCategories: Category[];
  /** categoryId → cantidad de productos asignados directamente a esa categoría */
  productCounts: Record<string, number>;
}) {
  const router = useRouter();
  const nameRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [name, setName] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [parentId, setParentId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingNameEn, setEditingNameEn] = useState("");
  const [editingParentId, setEditingParentId] = useState("");

  const parents = initialCategories.filter((c) => !c.parentId);
  const childrenOf = (id: string) => initialCategories.filter((c) => c.parentId === id);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await createCategory({ name, nameEn, parentId });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      toast.error(result.error);
      return;
    }
    toast.success(parentId ? "Subcategoría creada." : "Categoría creada.");
    setName("");
    setNameEn("");
    // parentId queda: es habitual cargar varias subcategorías seguidas
    router.refresh();
  }

  function startAddingSub(parent: Category) {
    setParentId(parent.id);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    nameRef.current?.focus({ preventScroll: true });
  }

  function startEditing(cat: Category) {
    setEditingId(cat.id);
    setEditingName(cat.name);
    setEditingNameEn(cat.nameEn ?? "");
    setEditingParentId(cat.parentId ?? "");
  }

  async function handleUpdate(id: string) {
    if (!(await confirmToast("¿Guardar los cambios?"))) return;
    const result = await updateCategory(id, {
      name: editingName,
      nameEn: editingNameEn,
      parentId: editingParentId,
    });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Cambios guardados.");
    setEditingId(null);
    router.refresh();
  }

  async function handleDelete(cat: Category) {
    const subs = childrenOf(cat.id);
    const affectedProducts =
      (productCounts[cat.id] ?? 0) + subs.reduce((sum, s) => sum + (productCounts[s.id] ?? 0), 0);
    const productsNote =
      affectedProducts > 0
        ? ` ${plural(affectedProducts, "producto quedará", "productos quedarán")} sin categoría.`
        : "";

    if (subs.length === 0) {
      if (!(await confirmToast(`¿Eliminar «${cat.name}»?${productsNote}`))) return;
    } else {
      // Dos confirmaciones: borrar una categoría arrastra a todas sus subcategorías.
      const list = subs.map((s) => s.name).join(", ");
      const first = await confirmToast(
        `«${cat.name}» tiene ${plural(subs.length, "subcategoría conectada", "subcategorías conectadas")}: ${list}. Si la eliminás, también se eliminan.${productsNote}`,
      );
      if (!first) return;
      const second = await confirmToast(
        `Última confirmación: se eliminará «${cat.name}» y ${plural(subs.length, "su subcategoría", "sus subcategorías")}. No se puede deshacer.`,
      );
      if (!second) return;
    }

    const result = await deleteCategory(cat.id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(subs.length > 0 ? "Categoría y subcategorías eliminadas." : "Eliminada.");
    router.refresh();
  }

  function renderEditForm(cat: Category) {
    // una categoría con subcategorías no puede pasar a ser subcategoría (un solo nivel)
    const canMove = childrenOf(cat.id).length === 0;
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleUpdate(cat.id);
        }}
        className="grid gap-3 py-2 sm:grid-cols-2"
      >
        <Input
          value={editingName}
          onChange={(e) => setEditingName(e.target.value)}
          aria-label="Nombre"
          autoFocus
          enterKeyHint="next"
        />
        <Input
          value={editingNameEn}
          onChange={(e) => setEditingNameEn(e.target.value)}
          aria-label="Nombre en inglés"
          placeholder="En inglés (opcional)"
          lang="en"
          enterKeyHint="done"
        />
        {canMove && (
          <Select
            value={editingParentId}
            onChange={(e) => setEditingParentId(e.target.value)}
            aria-label="Ubicación"
            className="sm:col-span-2"
          >
            <option value="">Categoría principal</option>
            {parents
              .filter((p) => p.id !== cat.id)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  Subcategoría de {p.name}
                </option>
              ))}
          </Select>
        )}
        <div className="grid grid-cols-2 gap-2 sm:col-span-2 sm:flex sm:justify-end">
          <Button type="button" variant="secondary" size="sm" onClick={() => setEditingId(null)}>
            Cancelar
          </Button>
          <Button type="submit" size="sm" disabled={!editingName.trim()}>
            Guardar
          </Button>
        </div>
      </form>
    );
  }

  function renderActions(cat: Category, isParent: boolean) {
    return (
      <div className="flex shrink-0 items-center gap-1">
        {isParent && (
          <Button type="button" variant="secondary" size="sm" onClick={() => startAddingSub(cat)}>
            + Subcategoría
          </Button>
        )}
        <IconButton label={`Editar ${cat.name}`} onClick={() => startEditing(cat)}>
          <PencilIcon />
        </IconButton>
        <IconButton label={`Eliminar ${cat.name}`} tone="danger" onClick={() => handleDelete(cat)}>
          <TrashIcon />
        </IconButton>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <form
        ref={formRef}
        onSubmit={handleCreate}
        className="space-y-4 rounded-xl border border-neutral-200 bg-white p-5"
      >
        <h2 className="text-sm font-semibold text-neutral-900">
          {parentId ? "Nueva subcategoría" : "Nueva categoría"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="new-category">Nombre</Label>
            <Input
              id="new-category"
              ref={nameRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Remeras"
              autoCapitalize="sentences"
              enterKeyHint="next"
            />
          </div>
          <div>
            <Label htmlFor="new-category-en">En inglés (opcional)</Label>
            <Input
              id="new-category-en"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="Ej: Tees"
              lang="en"
              enterKeyHint="done"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="new-category-parent">Ubicación</Label>
            <Select
              id="new-category-parent"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
            >
              <option value="">Categoría principal</option>
              {parents.map((p) => (
                <option key={p.id} value={p.id}>
                  Subcategoría de {p.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <FieldError message={error ?? undefined} />
        <div className="flex justify-end">
          <Button type="submit" disabled={submitting || !name.trim()}>
            {parentId ? "Agregar subcategoría" : "Agregar categoría"}
          </Button>
        </div>
      </form>

      {parents.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-300 px-4 py-10 text-center text-sm text-neutral-500">
          Todavía no creaste ninguna categoría.
        </p>
      ) : (
        <ul className="space-y-4">
          {parents.map((cat) => {
            const subs = childrenOf(cat.id);
            return (
              <li key={cat.id} className="rounded-xl border border-neutral-200 bg-white">
                <div className="px-5 py-3">
                  {editingId === cat.id ? (
                    renderEditForm(cat)
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                      <div className="min-w-0">
                        <p className="truncate text-base font-medium text-neutral-900 sm:text-sm">
                          {cat.name}
                          <span className="font-normal text-neutral-400">
                            {" · "}
                            {cat.nameEn || "sin inglés"}
                          </span>
                        </p>
                        <p className="mt-0.5 text-xs text-neutral-500">
                          {plural(subs.length, "subcategoría", "subcategorías")}
                          {" · "}
                          {plural(productCounts[cat.id] ?? 0, "producto", "productos")}
                        </p>
                      </div>
                      {renderActions(cat, true)}
                    </div>
                  )}
                </div>

                {subs.length > 0 && (
                  <ul className="mx-5 mb-4 divide-y divide-neutral-100 border-l-2 border-neutral-200 pl-4">
                    {subs.map((sub) => (
                      <li key={sub.id} className="py-2">
                        {editingId === sub.id ? (
                          renderEditForm(sub)
                        ) : (
                          <div className="flex items-center justify-between gap-3">
                            <p className="min-w-0 truncate text-base text-neutral-800 sm:text-sm">
                              {sub.name}
                              <span className="text-neutral-400">
                                {" · "}
                                {sub.nameEn || "sin inglés"}
                                {" · "}
                                {plural(productCounts[sub.id] ?? 0, "producto", "productos")}
                              </span>
                            </p>
                            {renderActions(sub, false)}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
