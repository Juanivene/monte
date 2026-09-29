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

  function stepStock(size: Size, delta: number) {
    setVariants((prev) => ({ ...prev, [size]: Math.max(0, (prev[size] ?? 0) + delta) }));
  }

  const sectionClass = "rounded-xl border border-neutral-200 bg-white p-4 sm:p-5";
  const sectionTitleClass = "mb-4 text-sm font-semibold text-neutral-900";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {!isEditing && otherProducts.length > 0 && (
        <section className="rounded-xl bg-neutral-100 p-4">
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

      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>Datos</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="name" required>
              Nombre
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoCapitalize="sentences"
              enterKeyHint="next"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:col-span-2 sm:gap-4">
            <div>
              <Label htmlFor="price" required>
                Precio (USD)
              </Label>
              <Input
                id="price"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                enterKeyHint="next"
                required
              />
            </div>
            <div>
              <Label htmlFor="colorName">Color</Label>
              <Input
                id="colorName"
                value={colorName}
                onChange={(e) => setColorName(e.target.value)}
                placeholder="Opcional"
                autoCapitalize="sentences"
                enterKeyHint="next"
              />
            </div>
          </div>
          <div className="sm:col-span-2">
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
          <div className="sm:col-span-2">
            <Label htmlFor="description" required>
              Descripción
            </Label>
            <Textarea
              id="description"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              autoCapitalize="sentences"
              required
            />
          </div>
          {/* Toda la fila es tocable, no solo el checkbox de 16px. */}
          <label
            htmlFor="isActive"
            className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-neutral-200 px-4 py-3 active:bg-neutral-50 sm:col-span-2"
          >
            <span>
              <span className="block text-sm font-medium text-neutral-900">Visible en la tienda</span>
              <span className="block text-xs text-neutral-500">
                {isActive ? "Los clientes lo ven y lo pueden comprar." : "Oculto: solo lo ves vos."}
              </span>
            </span>
            <input
              id="isActive"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-5 w-5 shrink-0 rounded border-neutral-300 accent-neutral-900"
            />
          </label>
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>Imágenes</h2>
        <ImageUploader images={images} onChange={setImages} />
      </section>

      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>Stock por talle</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {SIZES.map((size) => (
            <div key={size}>
              <label htmlFor={`stock-${size}`} className="mb-1 block text-xs font-medium text-neutral-600">
                {size}
              </label>
              <div className="flex items-stretch">
                <button
                  type="button"
                  onClick={() => stepStock(size, -1)}
                  disabled={variants[size] <= 0}
                  aria-label={`Restar uno al talle ${size}`}
                  className="w-10 shrink-0 rounded-l-xs border border-r-0 border-ink/15 text-lg text-neutral-600 active:bg-neutral-100 disabled:opacity-30"
                >
                  −
                </button>
                <Input
                  id={`stock-${size}`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={variants[size]}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) =>
                    setVariants((prev) => ({ ...prev, [size]: Number(e.target.value) || 0 }))
                  }
                  className="min-w-0 text-center tabular-nums"
                />
                <button
                  type="button"
                  onClick={() => stepStock(size, 1)}
                  aria-label={`Sumar uno al talle ${size}`}
                  className="w-10 shrink-0 rounded-r-xs border border-l-0 border-ink/15 text-lg text-neutral-600 active:bg-neutral-100"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/*
        En teléfono el botón de guardar queda pegado abajo (sobre la barra de
        pestañas) mientras se recorre el formulario, así no hay que bajar hasta el final.
      */}
      <div className="sticky bottom-[calc(env(safe-area-inset-bottom)+4rem)] z-20 -mx-4 border-t border-neutral-200 bg-neutral-50/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <FieldError message={error ?? undefined} />
        <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
          {submitting ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear producto"}
        </Button>
      </div>
    </form>
  );
}
