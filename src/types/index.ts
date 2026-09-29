import type { Size } from "@prisma/client";

export const SIZES: Size[] = ["XS", "S", "M", "L", "XL", "XXL"];

export type CartItem = {
  productId: string;
  productName: string;
  /** Versión en inglés del nombre, para mostrar el carrito en /en (opcional: carritos viejos no la tienen). */
  productNameEn?: string | null;
  slug: string;
  image: string | null;
  colorName: string | null;
  colorNameEn?: string | null;
  price: number;
  size: Size;
  quantity: number;
  /** stock disponible para ese talle al momento de agregarlo, para no dejar pasar de largo */
  maxStock: number;
};

export type { Size };
