"use client";

import { useState } from "react";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import type { CheckoutInput } from "@/lib/validations";
import { Button } from "@/components/ui/Button";
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
  async function createOrder(): Promise<string> {
    const res = await fetch("/api/paypal/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: buyerData.items }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "No se pudo iniciar el pago");
    return data.paypalOrderId as string;
  }

  async function approveOrder(
    paypalOrderId: string,
    restart?: () => void,
  ) {
    const res = await fetch("/api/paypal/capture-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...buyerData, paypalOrderId }),
    });
    const result = await res.json();
    if (!res.ok || !result.ok) {
      // Tarjeta rechazada: PayPal permite reintentar la misma orden con otro medio.
      if (result.declined && restart) {
        onError(result.error);
        restart();
        return;
      }
      onError(result.error ?? "No se pudo confirmar el pago");
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
              err instanceof Error ? err.message : "Error simulando el pago",
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
        onApprove={async (data, actions) =>
          approveOrder(data.orderID, actions.restart)
        }
        onError={() => {
          onError("Ocurrió un error con PayPal. Probá de nuevo.");
        }}
      />
    </PayPalScriptProvider>
  );
}

function MockPaypalButton({ onPay }: { onPay: () => Promise<void> }) {
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
      {loading ? "Procesando pago simulado..." : "Pagar con PayPal (modo mock)"}
    </Button>
  );
}

