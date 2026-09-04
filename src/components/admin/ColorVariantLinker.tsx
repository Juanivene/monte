"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import { confirmToast } from "@/lib/confirm-toast";
import { linkAsColorVariant, unlinkColorVariant } from "@/server/actions/products";

type LinkedProduct = { id: string; name: string; colorName: string | null };

export function ColorVariantLinker({
  productId,
  siblings,
  linkableProducts,
}: {
  productId: string;
  siblings: LinkedProduct[];
  linkableProducts: LinkedProduct[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState("");
  const [linking, setLinking] = useState(false);

  async function handleLink() {
    if (!selected) return;
    setLinking(true);
    const result = await linkAsColorVariant(productId, selected);
    setLinking(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success("Color vinculado.");
    setSelected("");
    router.refresh();
  }

  async function handleUnlink(otherId: string) {
    if (!(await confirmToast("¿Desvincular este color del producto?"))) return;
    const result = await unlinkColorVariant(otherId);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success("Color desvinculado.");
    router.refresh();
  }

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-4">
      <h2 className="text-sm font-medium text-neutral-900">Variantes de color</h2>

      {siblings.length > 0 ? (
        <ul className="mt-3 divide-y divide-neutral-200">
          {siblings.map((s) => (
            <li key={s.id} className="flex items-center justify-between py-2 text-sm">
              <Link href={`/admin/productos/${s.id}`} className="hover:underline">
                {s.name}
                {s.colorName ? ` · ${s.colorName}` : ""}
              </Link>
              <button
                type="button"
                onClick={() => handleUnlink(s.id)}
                className="text-xs text-neutral-400 hover:text-red-600"
              >
                Desvincular
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-neutral-500">
          Este producto no tiene otros colores vinculados.
        </p>
      )}

      {linkableProducts.length > 0 && (
        <div className="mt-4 flex items-end gap-2">
          <div className="flex-1">
            <Select value={selected} onChange={(e) => setSelected(e.target.value)}>
              <option value="">Vincular producto existente...</option>
              {linkableProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.colorName ? ` · ${p.colorName}` : ""}
                </option>
              ))}
            </Select>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={handleLink}
            disabled={!selected || linking}
          >
            Vincular
          </Button>
        </div>
      )}
    </section>
  );
}
