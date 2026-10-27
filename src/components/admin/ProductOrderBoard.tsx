"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { IconButton, ArrowUpIcon } from "./IconButton";
import { reorderProducts } from "@/server/actions/product-order";

type Item = {
  id: string;
  name: string;
  colorName: string | null;
  imageUrl: string | null;
  isActive: boolean;
};

/**
 * Grilla con los productos en el mismo orden que ve el cliente en la tienda.
 * Se reordenan arrastrando (computadora) o con las flechas (teléfono); cada
 * cambio se guarda solo, no hay botón de guardar.
 */
export function ProductOrderBoard({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState(initialItems);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  async function commit(next: Item[]) {
    const previous = items;
    setItems(next);
    const result = await reorderProducts(next.map((i) => i.id));
    if (!result.ok) {
      setItems(previous);
      toast.error(result.error);
    }
  }

  function moveTo(id: string, targetIndex: number) {
    const from = items.findIndex((i) => i.id === id);
    if (from === -1 || from === targetIndex) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(targetIndex, 0, moved);
    commit(next);
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((item, index) => (
        <li
          key={item.id}
          draggable
          onDragStart={(e) => {
            setDragId(item.id);
            e.dataTransfer.effectAllowed = "move";
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setOverId(item.id);
          }}
          onDrop={(e) => {
            e.preventDefault();
            if (dragId) moveTo(dragId, index);
            setDragId(null);
            setOverId(null);
          }}
          onDragEnd={() => {
            setDragId(null);
            setOverId(null);
          }}
          className={`cursor-grab overflow-hidden rounded-xl border bg-white active:cursor-grabbing ${
            overId === item.id && dragId !== item.id
              ? "border-neutral-900 ring-2 ring-neutral-900"
              : "border-neutral-200"
          } ${dragId === item.id ? "opacity-40" : ""}`}
        >
          <div className="relative aspect-[3/4] bg-neutral-100">
            {item.imageUrl && (
              <Image
                src={item.imageUrl}
                alt=""
                fill
                sizes="(min-width: 1024px) 20vw, 50vw"
                className={`pointer-events-none object-cover ${item.isActive ? "" : "opacity-50"}`}
              />
            )}
            <span className="absolute top-2 left-2 rounded-full bg-neutral-900 px-2 py-0.5 text-xs font-medium text-white">
              {index + 1}
            </span>
            {!item.isActive && (
              <span className="absolute top-2 right-2 rounded-full bg-white px-2 py-0.5 text-xs text-neutral-600">
                Oculto
              </span>
            )}
          </div>
          <div className="px-3 pt-2">
            <p className="truncate text-sm font-medium text-neutral-900">{item.name}</p>
            <p className="truncate text-xs text-neutral-500">{item.colorName ?? "\u00a0"}</p>
          </div>
          <div className="flex items-center justify-between px-1 pb-1">
            <IconButton
              label={`Mover ${item.name} antes`}
              onClick={() => moveTo(item.id, index - 1)}
              disabled={index === 0}
            >
              <span className="-rotate-90">
                <ArrowUpIcon />
              </span>
            </IconButton>
            <button
              type="button"
              onClick={() => moveTo(item.id, 0)}
              disabled={index === 0}
              className="rounded-lg px-2 py-2 text-xs text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              Al inicio
            </button>
            <IconButton
              label={`Mover ${item.name} después`}
              onClick={() => moveTo(item.id, index + 1)}
              disabled={index === items.length - 1}
            >
              <span className="rotate-90">
                <ArrowUpIcon />
              </span>
            </IconButton>
          </div>
        </li>
      ))}
    </ul>
  );
}
