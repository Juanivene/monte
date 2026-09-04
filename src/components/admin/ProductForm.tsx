"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select, Label, FieldError } from "@/components/ui/Field";
import { confirmToast } from "@/lib/confirm-toast";
import { ImageUploader } from "./ImageUploader";
import { SIZES, type Size } from "@/types";
import { createProduct, updateProduct, createColorVariant } from "@/server/actions/products";

type Category = { id: string; name: string };
type OtherProduct = { id: string; name: string; colorName: string | null };

type InitialProduct = {
  name: string;
  description: string;
  price: number;
  colorName: string | null;
  categoryId: string | null;
  isActive: boolean;
  images: string[];
  variants: { size: Size; stock: number }[];
};

const emptyVariants: Record<Size, number> = { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 };

function toVariantsRecord(variants: { size: Size; stock: number }[]): Record<Size, number> {
  const record = { ...emptyVariants };
  for (const v of variants) record[v.size] = v.stock;
  return record;
}

export function ProductForm({
  categories,
  productId,
  initialProduct,
  otherProducts,
}: {
  categories: Category[];
  productId?: string;
  initialProduct?: InitialProduct;
  otherProducts: OtherProduct[];
}) {
  const router = useRouter();
  const isEditing = Boolean(productId);

  const [name, setName] = useState(initialProduct?.name ?? "");
  const [description, setDescription] = useState(initialProduct?.description ?? "");
  const [price, setPrice] = useState(initialProduct ? String(initialProduct.price) : "");
  const [colorName, setColorName] = useState(initialProduct?.colorName ?? "");
  const [categoryId, setCategoryId] = useState(initialProduct?.categoryId ?? "");
  const [isActive, setIsActive] = useState(initialProduct?.isActive ?? true);
  const [images, setImages] = useState<string[]>(initialProduct?.images ?? []);
  const [variants, setVariants] = useState<Record<Size, number>>(
    initialProduct ? toVariantsRecord(initialProduct.variants) : emptyVariants,
  );
  const [baseProductId, setBaseProductId] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const priceNumber = Number(price);
    if (!priceNumber || priceNumber <= 0) {
      setError("Ingresá un precio válido");
      return;
    }

    if (isEditing && !(await confirmToast("¿Guardar los cambios de este producto?"))) return;

    const input = {
      name,
      description,
      price: priceNumber,
      colorName,
      categoryId,
      isActive,
      images,
      variants: SIZES.map((size) => ({ size, stock: variants[size] ?? 0 })),
    };

    setSubmitting(true);
    const result = isEditing
      ? await updateProduct(productId!, input)
      : baseProductId
        ? await createColorVariant(baseProductId, input)
        : await createProduct(input);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      toast.error(result.error);
      return;
    }

    toast.success(isEditing ? "Producto actualizado." : "Producto creado.");
    router.push("/admin/productos");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {!isEditing && otherProducts.length > 0 && (
        <section className="rounded-xl bg-neutral-50 p-4">
          <Label htmlFor="baseProduct">¿Es un color de un producto que ya existe? (opcional)</Label>
          <Select
            id="baseProduct"
            value={baseProductId}
            onChange={(e) => setBaseProductId(e.target.value)}
          >
            <option value="">No, es un producto nuevo</option>
            {otherProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.colorName ? ` · ${p.colorName}` : ""}
              </option>
            ))}
          </Select>
          <p className="mt-1 text-xs text-neutral-500">
            Se va a mostrar como otro color de ese producto, con su propio stock y fotos.
          </p>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="name" required>
            Nombre
          </Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="price" required>
            Precio (USD)
          </Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="colorName">Color (opcional)</Label>
          <Input
            id="colorName"
            value={colorName}
            onChange={(e) => setColorName(e.target.value)}
            placeholder="Ej: Negro"
          />
        </div>
        <div>
          <Label htmlFor="category">Categoría</Label>
          <Select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Sin categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input
            id="isActive"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-neutral-300"
          />
          <Label htmlFor="isActive">Visible en la tienda</Label>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="description" required>
            Descripción
          </Label>
          <Textarea
            id="description"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
      </section>

      <section>
        <Label>Imágenes</Label>
        <ImageUploader images={images} onChange={setImages} />
      </section>

      <section>
        <Label>Stock por talle</Label>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {SIZES.map((size) => (
            <div key={size}>
              <label htmlFor={`stock-${size}`} className="mb-1 block text-xs font-medium text-neutral-600">
                {size}
              </label>
              <Input
                id={`stock-${size}`}
                type="number"
                min="0"
                value={variants[size]}
                onChange={(e) =>
                  setVariants((prev) => ({ ...prev, [size]: Number(e.target.value) || 0 }))
                }
              />
            </div>
          ))}
        </div>
      </section>

      <FieldError message={error ?? undefined} />

      <Button type="submit" disabled={submitting}>
        {submitting ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear producto"}
      </Button>
    </form>
  );
}
