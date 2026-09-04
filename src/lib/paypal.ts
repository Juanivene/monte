/** Moneda única para el cobro por PayPal. Los precios en la DB ya están en USD;
 * cuando se agregue soporte de ARS, este es el único lugar a tocar para el cobro. */
export const CHECKOUT_CURRENCY = "USD";

const PAYPAL_API_BASE =
  process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

function getCredentials() {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Faltan las variables de entorno de PayPal");
  }
  return { clientId, clientSecret };
}

async function getPaypalAccessToken(): Promise<string> {
  const { clientId, clientSecret } = getCredentials();
  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) {
    throw new Error("No se pudo autenticar con PayPal");
  }
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export async function createPaypalOrder(total: number): Promise<string> {
  const accessToken = await getPaypalAccessToken();
  const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        { amount: { currency_code: CHECKOUT_CURRENCY, value: total.toFixed(2) } },
      ],
    }),
  });
  if (!res.ok) {
    throw new Error("No se pudo crear la orden de PayPal");
  }
  const data = (await res.json()) as { id: string };
  return data.id;
}

export type PaypalCaptureResult = { status: string; capturedAmount: number | null };

export async function capturePaypalOrder(paypalOrderId: string): Promise<PaypalCaptureResult> {
  const accessToken = await getPaypalAccessToken();
  const res = await fetch(
    `${PAYPAL_API_BASE}/v2/checkout/orders/${paypalOrderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );
  if (!res.ok) {
    return { status: "FAILED", capturedAmount: null };
  }
  const data = (await res.json()) as {
    status: string;
    purchase_units?: Array<{
      payments?: { captures?: Array<{ amount?: { value?: string } }> };
    }>;
  };
  const capturedValue = data.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value;
  return {
    status: data.status,
    capturedAmount: capturedValue ? Number(capturedValue) : null,
  };
}
