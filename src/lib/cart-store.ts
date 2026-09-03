import type { CartItem, Size } from "@/types";

const STORAGE_KEY = "monte:cart";
type Listener = () => void;

function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

let items: CartItem[] = readCart();
const listeners = new Set<Listener>();

function emit() {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
  listeners.forEach((listener) => listener());
}

export const cartStore = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot(): CartItem[] {
    return items;
  },
  getServerSnapshot(): CartItem[] {
    return [];
  },
  addItem(newItem: CartItem) {
    const existing = items.find(
      (i) => i.productId === newItem.productId && i.size === newItem.size,
    );
    if (existing) {
      const nextQuantity = Math.min(existing.quantity + newItem.quantity, existing.maxStock);
      items = items.map((i) => (i === existing ? { ...i, quantity: nextQuantity } : i));
    } else {
      items = [...items, { ...newItem, quantity: Math.min(newItem.quantity, newItem.maxStock) }];
    }
    emit();
  },
  removeItem(productId: string, size: Size) {
    items = items.filter((i) => !(i.productId === productId && i.size === size));
    emit();
  },
  updateQuantity(productId: string, size: Size, quantity: number) {
    items = items.map((i) =>
      i.productId === productId && i.size === size
        ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock)) }
        : i,
    );
    emit();
  },
  clear() {
    items = [];
    emit();
  },
};
