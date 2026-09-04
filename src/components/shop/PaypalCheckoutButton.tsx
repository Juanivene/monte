"use client";

import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import type { CheckoutInput } from "@/lib/validations";

const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";

export function PaypalCheckoutButton({
  buyerData,
  onSuccess,
  onError,
}: {
  buyerData: CheckoutInput;
  onSuccess: (orderId: string) => void;
  onError: (message: string) => void;
}) {
  return (
    <PayPalScriptProvider options={{ clientId, currency: "USD", intent: "capture" }}>
      <PayPalButtons
        style={{ layout: "vertical", label: "pay" }}
        createOrder={async () => {
          const res = await fetch("/api/paypal/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: buyerData.items }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "No se pudo iniciar el pago");
          return data.paypalOrderId as string;
        }}
        onApprove={async (data) => {
          const res = await fetch("/api/paypal/capture-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...buyerData, paypalOrderId: data.orderID }),
          });
          const result = await res.json();
          if (!res.ok || !result.ok) {
            onError(result.error ?? "No se pudo confirmar el pago");
            return;
          }
          onSuccess(result.orderId as string);
        }}
        onError={() => {
          onError("Ocurrió un error con PayPal. Probá de nuevo.");
        }}
      />
    </PayPalScriptProvider>
  );
}
