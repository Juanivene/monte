"use client";

import { useState } from "react";
import { toast } from "sonner";
import { IconButton, ArrowUpIcon, ArrowDownIcon } from "./IconButton";
import { reorderCategories } from "@/server/actions/categories";

type Item = { id: string; name: string; parentId: string | null };

function GripIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <circle cx="9" cy="6" r="1.6" />
      <circle cx="15" cy="6" r="1.6" />
      <circle cx="9" cy="12" r="1.6" />
      <circle cx="15" cy="12" r="1.6" />
      <circle cx="9" cy="18" r="1.6" />
      <circle cx="15" cy="18" r="1.6" />
    </svg>
  );
}

/**
 * Lista de categorías en el orden de la tienda. Se reordenan arrastrando
 * (dentro de su grupo: principales entre sí, subcategorías dentro de su
 * categoría) o con las flechas; cada cambio se guarda solo.
 */
export function CategoryOrderBoard({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState(initialItems);
  const [drag, setDrag] = useState<{ id: string; group: string } | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const siblingsOf = (parentId: string | null) => items.filter((i) => i.parentId === parentId);

  async function moveTo(parentId: string | null, id: string, to: number) {
    const group = siblingsOf(parentId);
    const from = group.findIndex((i) => i.id === id);
    if (from === -1 || from === to || to < 0 || to >= group.length) return;
    const reordered = [...group];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);

    const previous = items;
    // el resto de los grupos conserva su lugar; este se reemplaza por el nuevo orden
    setItems([...items.filter((i) => i.parentId !== parentId), ...reordered]);
    const result = await reorderCategories(reordered.map((i) => i.id));
    if (!result.ok) {
      setItems(previous);
      toast.error(result.error);
    }
  }

  function renderRow(item: Item, index: number, count: number) {
    const groupKey = item.parentId ?? "root";
    const isOver = drag && drag.group === groupKey && overId === item.id && drag.id !== item.id;
    return (
      <div
        key={item.id}
        draggable
        onDragStart={(e) => {
          e.stopPropagation();
          e.dataTransfer.effectAllowed = "move";
          setDrag({ id: item.id, group: groupKey });
        }}
        onDragOver={(e) => {
          if (!drag || drag.group !== groupKey) return;
          e.preventDefault();
          e.stopPropagation();
          setOverId(item.id);
        }}
        onDrop={(e) => {
          if (!drag || drag.group !== groupKey) return;
          e.preventDefault();
          e.stopPropagation();
          const dragged = drag.id;
          setDrag(null);
          setOverId(null);
          moveTo(item.parentId, dragged, index);
        }}
        onDragEnd={() => {
          setDrag(null);
          setOverId(null);
        }}
        className={`flex cursor-grab items-center gap-2 rounded-lg bg-white px-2 active:cursor-grabbing ${
          drag?.id === item.id ? "opacity-40" : ""
        } ${isOver ? "ring-2 ring-neutral-900" : ""}`}
      >
        <span className="text-neutral-400">
          <GripIcon />
        </span>
        <p className="min-w-0 flex-1 truncate py-3 text-base text-neutral-900 sm:text-sm">
          {item.name}
        </p>
        <IconButton
          label={`Subir ${item.name}`}
          onClick={() => moveTo(item.parentId, item.id, index - 1)}
          disabled={index === 0}
        >
          <ArrowUpIcon />
        </IconButton>
        <IconButton
          label={`Bajar ${item.name}`}
          onClick={() => moveTo(item.parentId, item.id, index + 1)}
          disabled={index === count - 1}
        >
          <ArrowDownIcon />
        </IconButton>
      </div>
    );
  }

  const parents = siblingsOf(null);

  return (
    <ul className="space-y-3">
      {parents.map((parent, i) => {
        const subs = siblingsOf(parent.id);
        return (
          <li key={parent.id} className="rounded-xl border border-neutral-200 bg-white p-2">
            {renderRow(parent, i, parents.length)}
            {subs.length > 0 && (
              <ul className="mt-1 ml-5 space-y-1 border-l-2 border-neutral-200 pl-3">
                {subs.map((sub, j) => (
                  <li key={sub.id}>
                    {renderRow(sub, j, subs.length)}
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}
