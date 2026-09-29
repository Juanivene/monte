"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/money";
import { useI18n } from "@/i18n/client";
import { checkoutErrorMessage, localePath, pick } from "@/i18n";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label, FieldError } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations";
import { submitCheckout } from "@/server/actions/checkout";
import { PaypalCheckoutButton } from "@/components/shop/PaypalCheckoutButton";

const buyerFieldsSchema = checkoutSchema.omit({ items: true });

type PaymentMethodOption = "transferencia" | "tarjeta";

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

export default function CheckoutPage() {
  const { items, subtotal, clear, isHydrated } = useCart();
  const { lang, t } = useI18n();
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    buyerName: "",
    buyerEmail: "",
    buyerPhone: "",
    shippingStreet: "",
    shippingCity: "",
    shippingState: "",
    shippingPostalCode: "",
    shippingCountry: t.checkout.defaultCountry,
    shippingNotes: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethodOption>("transferencia");
  // Datos del comprador ya validados: recién ahí se muestra el botón de PayPal.
  const [validatedBuyerData, setValidatedBuyerData] = useState<Omit<
    CheckoutInput,
    "items"
  > | null>(null);

  const orderReceivedPath = (orderId: string) =>
    localePath(lang, `/pedido-recibido/${orderId}`);

  function handleChange(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setValidatedBuyerData(null);
    };
  }

  /** Valida los datos del comprador; si hay errores los muestra y devuelve null. */
  function validateBuyer() {
    const parsed = buyerFieldsSchema.safeParse({ ...form, locale: lang });
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof FormState, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FormState;
        if (!fieldErrors[key]) fieldErrors[key] = checkoutErrorMessage(lang, issue.message);
      }
      setErrors(fieldErrors);
      return null;
    }
    setErrors({});
    return parsed.data;
  }

  function handleContinueToPayment() {
    setFormError(null);
    const data = validateBuyer();
    if (data) setValidatedBuyerData(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const data = validateBuyer();
    if (!data) return;
    setSubmitting(true);

    const result = await submitCheckout({
      ...data,
      items: items.map((i) => ({
        productId: i.productId,
        size: i.size,
        quantity: i.quantity,
      })),
    });

    setSubmitting(false);

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    clear();
    router.push(orderReceivedPath(result.orderId));
  }

  if (isHydrated && items.length === 0) {
    return (
      <div className="container-page py-20 sm:py-28">
        <EmptyState
          title={t.cart.emptyTitle}
          description={t.checkout.emptyBody}
          action={
            <Link href={localePath(lang, "/")}>
              <Button size="lg">{t.cart.viewCollection}</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const paypalButton = validatedBuyerData ? (
    <PaypalCheckoutButton
      buyerData={{
        ...validatedBuyerData,
        items: items.map((i) => ({
          productId: i.productId,
          size: i.size,
          quantity: i.quantity,
        })),
      }}
      onSuccess={(orderId) => {
        clear();
        router.push(orderReceivedPath(orderId));
      }}
      onError={setFormError}
    />
  ) : (
    <Button type="button" size="lg" className="w-full" onClick={handleContinueToPayment}>
      {t.checkout.continueToPayment}
    </Button>
  );

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="border-ink/12 border-b pb-6">
        <p className="eyebrow text-ink-muted">{t.checkout.step}</p>
        <h1 className="headline mt-3 text-4xl sm:text-5xl">{t.checkout.title}</h1>
        <p className="text-ink-muted mt-3 max-w-lg text-sm leading-relaxed">
          {t.checkout.intro}
        </p>
      </div>

      <div className="grid gap-10 pt-10 lg:grid-cols-[1fr_20rem] lg:gap-16">
        <form
          id="checkout-form"
          onSubmit={handleSubmit}
          className="space-y-12"
          noValidate
        >
          <section>
            <SectionTitle index="01" title={t.checkout.buyerSection} />
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="buyerName" required>
                  {t.checkout.name}
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
                  {t.checkout.email}
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
                  {t.checkout.phone}
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
            <SectionTitle index="02" title={t.checkout.shippingSection} />
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="shippingStreet" required>
                  {t.checkout.street}
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
                  {t.checkout.city}
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
                <Label htmlFor="shippingState">{t.checkout.state}</Label>
                <Input
                  id="shippingState"
                  autoComplete="address-level1"
                  value={form.shippingState}
                  onChange={handleChange("shippingState")}
                />
              </div>
              <div>
                <Label htmlFor="shippingPostalCode">{t.checkout.postalCode}</Label>
                <Input
                  id="shippingPostalCode"
                  autoComplete="postal-code"
                  value={form.shippingPostalCode}
                  onChange={handleChange("shippingPostalCode")}
                />
              </div>
              <div>
                <Label htmlFor="shippingCountry" required>
                  {t.checkout.country}
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
                <Label htmlFor="shippingNotes">{t.checkout.notes}</Label>
                <Textarea
                  id="shippingNotes"
                  rows={3}
                  placeholder={t.checkout.notesPlaceholder}
                  value={form.shippingNotes}
                  onChange={handleChange("shippingNotes")}
                />
              </div>
            </div>
          </section>

          <section>
            <SectionTitle index="03" title={t.checkout.paymentSection} />
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { value: "transferencia", label: t.checkout.transfer },
                  { value: "tarjeta", label: t.checkout.card },
                ] as const
              ).map((option) => {
                const selected = paymentMethod === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setPaymentMethod(option.value)}
                    className={`h-12 border text-xs font-medium tracking-wide transition-colors duration-200 ${
                      selected
                        ? "border-ink bg-ink text-bone"
                        : "border-ink/20 text-ink hover:border-ink"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            <p className="text-ink-muted mt-3 text-xs leading-relaxed">
              {paymentMethod === "transferencia" ? t.checkout.transferHint : t.checkout.cardHint}
            </p>
          </section>

          {formError && (
            <p className="dark:border-red-500 dark:bg-red-950 dark:text-red-300 border-l-2 border-red-700 bg-red-50 px-4 py-3 text-sm text-red-800">
              {formError}
            </p>
          )}

          <div className="lg:hidden">
            {paymentMethod === "transferencia" ? (
              <Button type="submit" size="lg" disabled={submitting} className="w-full">
                {submitting ? t.checkout.sending : t.checkout.confirm}
              </Button>
            ) : (
              paypalButton
            )}
          </div>
        </form>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="border-ink/12 border p-6">
            <p className="eyebrow text-ink-muted">{t.checkout.yourOrder}</p>

            <ul className="divide-ink/10 mt-5 divide-y">
              {items.map((item) => (
                <li
                  key={`${item.productId}-${item.size}`}
                  className="flex gap-3 py-3"
                >
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
                    <p className="text-ink truncate text-xs font-medium">
                      {pick(lang, item.productName, item.productNameEn)}
                    </p>
                    <p className="text-ink-muted mt-0.5 text-[0.7rem]">
                      {t.checkout.qtyAndSize(item.quantity, item.size)}
                    </p>
                  </div>
                  <p className="text-ink shrink-0 text-xs tabular-nums">
                    {formatPrice(item.price * item.quantity, lang)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="border-ink/12 mt-4 flex items-baseline justify-between border-t pt-4">
              <span className="eyebrow text-ink">{t.cart.total}</span>
              <span className="headline text-xl tabular-nums">
                {formatPrice(subtotal, lang)}
              </span>
            </div>

            <div className="mt-6 hidden lg:block">
              {paymentMethod === "transferencia" ? (
                <Button
                  type="submit"
                  form="checkout-form"
                  size="lg"
                  disabled={submitting}
                  className="w-full"
                >
                  {submitting ? t.checkout.sending : t.checkout.confirm}
                </Button>
              ) : (
                paypalButton
              )}
            </div>

            <p className="text-ink-muted mt-4 text-[0.7rem] leading-relaxed">
              {paymentMethod === "transferencia"
                ? t.checkout.transferFootnote
                : t.checkout.cardFootnote}
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
