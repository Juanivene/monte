"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
      <div className="container-page py-20 sm:py-28">
        <EmptyState
          title="Tu carrito está vacío"
          description="Agregá algo antes de completar el pedido."
          action={
            <Link href="/">
              <Button size="lg">Ver colección</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="border-ink/12 border-b pb-6">
        <p className="eyebrow text-ink-muted">Paso 2 de 2</p>
        <h1 className="headline mt-3 text-4xl sm:text-5xl">Finalizar pedido</h1>
        <p className="text-ink-muted mt-3 max-w-lg text-sm leading-relaxed">
          Dejanos tus datos y el pedido queda reservado. El pago y el envío los coordinamos
          después, por WhatsApp.
        </p>
      </div>

      <div className="grid gap-10 pt-10 lg:grid-cols-[1fr_20rem] lg:gap-16">
        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-12" noValidate>
          <section>
            <SectionTitle index="01" title="Tus datos" />
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="buyerName" required>
                  Nombre y apellido
                </Label>
                <Input
                  id="buyerName"
                  autoComplete="name"
                  value={form.buyerName}
                  onChange={handleChange("buyerName")}
                />
                <FieldError message={errors.buyerName} />
              </div>
              <div>
                <Label htmlFor="buyerEmail" required>
                  Email
                </Label>
                <Input
                  id="buyerEmail"
                  type="email"
                  autoComplete="email"
                  value={form.buyerEmail}
                  onChange={handleChange("buyerEmail")}
                />
                <FieldError message={errors.buyerEmail} />
              </div>
              <div>
                <Label htmlFor="buyerPhone" required>
                  Teléfono
                </Label>
                <Input
                  id="buyerPhone"
                  type="tel"
                  autoComplete="tel"
                  value={form.buyerPhone}
                  onChange={handleChange("buyerPhone")}
                />
                <FieldError message={errors.buyerPhone} />
              </div>
            </div>
          </section>

          <section>
            <SectionTitle index="02" title="Dirección de envío" />
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="shippingStreet" required>
                  Calle y número
                </Label>
                <Input
                  id="shippingStreet"
                  autoComplete="street-address"
                  value={form.shippingStreet}
                  onChange={handleChange("shippingStreet")}
                />
                <FieldError message={errors.shippingStreet} />
              </div>
              <div>
                <Label htmlFor="shippingCity" required>
                  Localidad
                </Label>
                <Input
                  id="shippingCity"
                  autoComplete="address-level2"
                  value={form.shippingCity}
                  onChange={handleChange("shippingCity")}
                />
                <FieldError message={errors.shippingCity} />
              </div>
              <div>
                <Label htmlFor="shippingState">Provincia</Label>
                <Input
                  id="shippingState"
                  autoComplete="address-level1"
                  value={form.shippingState}
                  onChange={handleChange("shippingState")}
                />
              </div>
              <div>
                <Label htmlFor="shippingPostalCode">Código postal</Label>
                <Input
                  id="shippingPostalCode"
                  autoComplete="postal-code"
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
                  autoComplete="country-name"
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
                  placeholder="Timbre, horarios, referencias…"
                  value={form.shippingNotes}
                  onChange={handleChange("shippingNotes")}
                />
              </div>
            </div>
          </section>

          {formError && (
            <p className="dark:border-red-500 dark:bg-red-950 dark:text-red-300 border-l-2 border-red-700 bg-red-50 px-4 py-3 text-sm text-red-800">
              {formError}
            </p>
          )}

          <div className="lg:hidden">
            <Button type="submit" size="lg" disabled={submitting} className="w-full">
              {submitting ? "Enviando…" : "Confirmar pedido"}
            </Button>
          </div>
        </form>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="border-ink/12 border p-6">
            <p className="eyebrow text-ink-muted">Tu pedido</p>

            <ul className="divide-ink/10 mt-5 divide-y">
              {items.map((item) => (
                <li key={`${item.productId}-${item.size}`} className="flex gap-3 py-3">
                  <div className="bg-bone-dark relative aspect-3/4 w-12 shrink-0 overflow-hidden">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-ink truncate text-xs font-medium">{item.productName}</p>
                    <p className="text-ink-muted mt-0.5 text-[0.7rem]">
                      {item.quantity} × Talle {item.size}
                    </p>
                  </div>
                  <p className="text-ink shrink-0 text-xs tabular-nums">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="border-ink/12 mt-4 flex items-baseline justify-between border-t pt-4">
              <span className="eyebrow text-ink">Total</span>
              <span className="headline text-xl tabular-nums">{formatPrice(subtotal)}</span>
            </div>

            <div className="mt-6 hidden lg:block">
              <Button
                type="submit"
                form="checkout-form"
                size="lg"
                disabled={submitting}
                className="w-full"
              >
                {submitting ? "Enviando…" : "Confirmar pedido"}
              </Button>
            </div>

            <p className="text-ink-muted mt-4 text-[0.7rem] leading-relaxed">
              No se procesa ningún pago acá. Después de confirmar, coordinamos el pago y el envío
              por WhatsApp.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SectionTitle({ index, title }: { index: string; title: string }) {
  return (
    <div className="border-ink/12 mb-6 flex items-baseline gap-3 border-b pb-3">
      <span className="headline text-accent-deep text-xs">{index}</span>
      <h2 className="headline text-ink text-lg">{title}</h2>
    </div>
  );
}
