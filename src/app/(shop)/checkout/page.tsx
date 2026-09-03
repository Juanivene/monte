"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/money";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label, FieldError } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";
import { checkoutSchema } from "@/lib/validations";
import { submitCheckout } from "@/server/actions/checkout";

const buyerFieldsSchema = checkoutSchema.omit({ items: true });

type FormState = {
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  shippingStreet: string;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry: string;
  shippingNotes: string;
};

const initialState: FormState = {
  buyerName: "",
  buyerEmail: "",
  buyerPhone: "",
  shippingStreet: "",
  shippingCity: "",
  shippingState: "",
  shippingPostalCode: "",
  shippingCountry: "Argentina",
  shippingNotes: "",
};

export default function CheckoutPage() {
  const { items, subtotal, clear, isHydrated } = useCart();
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function handleChange(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const parsed = buyerFieldsSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof FormState, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FormState;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    const result = await submitCheckout({
      ...parsed.data,
      items: items.map((i) => ({ productId: i.productId, size: i.size, quantity: i.quantity })),
    });

    setSubmitting(false);

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    clear();
    router.push(`/pedido-recibido/${result.orderId}`);
  }

  if (isHydrated && items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Tu carrito está vacío"
          description="Agregá productos antes de hacer el checkout."
          action={
            <Link href="/">
              <Button>Ver catálogo</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-xl font-semibold text-neutral-900">Finalizar pedido</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-8">
        <section>
          <h2 className="text-sm font-medium text-neutral-900">Tus datos</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="buyerName" required>
                Nombre y apellido
              </Label>
              <Input id="buyerName" value={form.buyerName} onChange={handleChange("buyerName")} />
              <FieldError message={errors.buyerName} />
            </div>
            <div>
              <Label htmlFor="buyerEmail" required>
                Email
              </Label>
              <Input
                id="buyerEmail"
                type="email"
                value={form.buyerEmail}
                onChange={handleChange("buyerEmail")}
              />
              <FieldError message={errors.buyerEmail} />
            </div>
            <div>
              <Label htmlFor="buyerPhone" required>
                Teléfono
              </Label>
              <Input id="buyerPhone" value={form.buyerPhone} onChange={handleChange("buyerPhone")} />
              <FieldError message={errors.buyerPhone} />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-medium text-neutral-900">Dirección de envío</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="shippingStreet" required>
                Calle y número
              </Label>
              <Input
                id="shippingStreet"
                value={form.shippingStreet}
                onChange={handleChange("shippingStreet")}
              />
              <FieldError message={errors.shippingStreet} />
            </div>
            <div>
              <Label htmlFor="shippingCity" required>
                Localidad
              </Label>
              <Input id="shippingCity" value={form.shippingCity} onChange={handleChange("shippingCity")} />
              <FieldError message={errors.shippingCity} />
            </div>
            <div>
              <Label htmlFor="shippingState">Provincia</Label>
              <Input id="shippingState" value={form.shippingState} onChange={handleChange("shippingState")} />
            </div>
            <div>
              <Label htmlFor="shippingPostalCode">Código postal</Label>
              <Input
                id="shippingPostalCode"
                value={form.shippingPostalCode}
                onChange={handleChange("shippingPostalCode")}
              />
            </div>
            <div>
              <Label htmlFor="shippingCountry" required>
                País
              </Label>
              <Input
                id="shippingCountry"
                value={form.shippingCountry}
                onChange={handleChange("shippingCountry")}
              />
              <FieldError message={errors.shippingCountry} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="shippingNotes">Notas para la entrega (opcional)</Label>
              <Textarea
                id="shippingNotes"
                rows={3}
                value={form.shippingNotes}
                onChange={handleChange("shippingNotes")}
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl bg-neutral-50 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600">{items.length} producto(s)</span>
            <span className="font-semibold text-neutral-900">{formatPrice(subtotal)}</span>
          </div>
        </section>

        {formError && <p className="text-sm text-red-600">{formError}</p>}

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Enviando..." : "Confirmar pedido"}
        </Button>
        <p className="text-center text-xs text-neutral-500">
          No se procesa ningún pago acá. Vamos a coordinar el pago y el envío por WhatsApp.
        </p>
      </form>
    </div>
  );
}
