import { z } from "zod";
import { SIZES } from "@/types";

export const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  size: z.enum(SIZES as [string, ...string[]]),
  quantity: z.number().int().min(1).max(20),
});

export const checkoutSchema = z.object({
  buyerName: z.string().trim().min(2, "Ingresá tu nombre completo").max(120),
  buyerEmail: z.string().trim().email("Ingresá un email válido"),
  buyerPhone: z.string().trim().min(6, "Ingresá un teléfono de contacto").max(30),
  shippingStreet: z.string().trim().min(3, "Ingresá la calle y número").max(200),
  shippingCity: z.string().trim().min(2, "Ingresá la localidad").max(120),
  shippingState: z.string().trim().max(120).optional().or(z.literal("")),
  shippingPostalCode: z.string().trim().max(20).optional().or(z.literal("")),
  shippingCountry: z.string().trim().min(2).max(60).default("Argentina"),
  shippingNotes: z.string().trim().max(500).optional().or(z.literal("")),
  items: z.array(checkoutItemSchema).min(1, "El carrito está vacío"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const categorySchema = z.object({
  name: z.string().trim().min(2, "El nombre es muy corto").max(80),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export const productVariantSchema = z.object({
  size: z.enum(SIZES as [string, ...string[]]),
  stock: z.number().int().min(0).max(100000),
});

export const productSchema = z.object({
  name: z.string().trim().min(2, "El nombre es muy corto").max(150),
  description: z.string().trim().min(1, "Agregá una descripción").max(4000),
  price: z.number().positive("El precio debe ser mayor a 0"),
  colorName: z.string().trim().max(60).optional().or(z.literal("")),
  categoryId: z.string().min(1).optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  images: z.array(z.string().url()).max(10),
  variants: z.array(productVariantSchema).min(1, "Definí stock para al menos un talle"),
});

export type ProductInput = z.infer<typeof productSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("Ingresá un email válido"),
  password: z.string().min(1, "Ingresá tu contraseña"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const orderStatusSchema = z.object({
  status: z.enum(["PENDIENTE", "CONFIRMADO", "ENVIADO", "ENTREGADO", "CANCELADO"]),
});
