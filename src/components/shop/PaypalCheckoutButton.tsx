"use client";

import { useState } from "react";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import type { CheckoutInput } from "@/lib/validations";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/i18n/client";
//todo remover
import { MOCK_MODE } from "@/lib/mock/config";

const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";
// Solo sandbox: PayPal decide si muestra el botón de tarjeta según el país del
// comprador (por IP). Desde Argentina no aparece, así que para probarlo se
// fuerza un país elegible (ej. "US"). En live dejarlo vacío.
const buyerCountry = process.env.NEXT_PUBLIC_PAYPAL_BUYER_COUNTRY || undefined;

export function PaypalCheckoutButton({
  buyerData,
  onSuccess,
  onError,
}: {
  buyerData: CheckoutInput;
  onSuccess: (orderId: string) => void;
  onError: (message: string) => void;
}) {
  const { t } = useI18n();

  async function createOrder(): Promise<string> {
    const res = await fetch("/api/paypal/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: buyerData.items, locale: buyerData.locale }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? t.errors.paypalStart);
    return data.paypalOrderId as string;
  }

  async function approveOrder(paypalOrderId: string) {
    const res = await fetch("/api/paypal/capture-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...buyerData, paypalOrderId }),
    });
    const result = await res.json();
    if (!res.ok || !result.ok) {
      // Si la tarjeta fue rechazada no usamos actions.restart(): con los campos
      // de tarjeta inline dispara el onError del SDK y abre un modal extra.
      // El comprador reintenta con el botón, que crea una orden nueva.
      onError(result.error ?? t.errors.paypalConfirm);
      return;
    }
    onSuccess(result.orderId as string);
  }

  // En modo mock evitamos cargar el SDK real de PayPal (requiere clientId y
  // red hacia paypal.com). Las rutas /api/paypal/* siguen corriendo igual,
  // solo que src/lib/paypal.ts simula la respuesta de PayPal.
  if (MOCK_MODE) {
    return (
      <MockPaypalButton
        onPay={async () => {
          try {
            const paypalOrderId = await createOrder();
            await approveOrder(paypalOrderId);
          } catch (err) {
            onError(
              err instanceof Error ? err.message : t.errors.paypalGeneric,
            );
          }
        }}
      />
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        currency: "USD",
        intent: "capture",
        enableFunding: "card",
        buyerCountry,
      }}
    >
      <PayPalButtons
        style={{ layout: "vertical", label: "pay" }}
        createOrder={createOrder}
        onApprove={async (data) => approveOrder(data.orderID)}
        onError={() => {
          onError(t.errors.paypalGeneric);
        }}
      />
    </PayPalScriptProvider>
  );
}

function MockPaypalButton({ onPay }: { onPay: () => Promise<void> }) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);

  return (
    <Button
      type="button"
      size="lg"
      className="w-full"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await onPay();
        setLoading(false);
      }}
    >
      {loading ? t.errors.mockPaying : t.errors.mockPay}
    </Button>
  );
}

