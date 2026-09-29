//todo remover
import { nanoid } from "nanoid";
import { MOCK_MODE } from "./mock/config";

/** Moneda única para el cobro por PayPal. Los precios en la DB ya están en USD;
 * cuando se agregue soporte de ARS, este es el único lugar a tocar para el cobro. */
export const CHECKOUT_CURRENCY = "USD";

// Modo mock: no se llama a la API de PayPal. Guardamos el total por orden acá
// para que capturePaypalOrder pueda devolver el mismo monto, tal como haría
// un pago real, sin depender de credenciales.
const mockOrderTotals = new Map<string, number>();

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
  if (MOCK_MODE) {
    const id = `MOCK-${nanoid(12)}`;
    mockOrderTotals.set(id, total);
    return id;
  }

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
        {
          amount: { currency_code: CHECKOUT_CURRENCY, value: total.toFixed(2) },
        },
      ],
    }),
  });
  if (!res.ok) {
    throw new Error("No se pudo crear la orden de PayPal");
  }
  const data = (await res.json()) as { id: string };
  return data.id;
}

export type PaypalCaptureResult =
  | { status: "COMPLETED"; capturedAmount: number }
  | {
      status: "DECLINED" | "PENDING" | "FAILED";
      capturedAmount: null;
      /** Código de PayPal (ej. INSTRUMENT_DECLINED) o motivo del PENDING, para logs. */
      reason?: string;
    };

type PaypalCapture = {
  status?: string;
  amount?: { value?: string; currency_code?: string };
  status_details?: { reason?: string };
};

export async function capturePaypalOrder(
  paypalOrderId: string,
): Promise<PaypalCaptureResult> {
  if (MOCK_MODE) {
    const total = mockOrderTotals.get(paypalOrderId);
    mockOrderTotals.delete(paypalOrderId);
    if (total === undefined) return { status: "FAILED", capturedAmount: null };
    return { status: "COMPLETED", capturedAmount: total };
  }

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
  const data = (await res.json().catch(() => null)) as {
    status?: string;
    details?: Array<{ issue?: string }>;
    purchase_units?: Array<{ payments?: { captures?: PaypalCapture[] } }>;
  } | null;

  if (!res.ok) {
    // Tarjeta rechazada, fondos insuficientes, etc. PayPal responde 422 con
    // el motivo en details[0].issue.
    const issue = data?.details?.[0]?.issue;
    return {
      status: issue === "INSTRUMENT_DECLINED" ? "DECLINED" : "FAILED",
      capturedAmount: null,
      reason: issue,
    };
  }

  // Que la orden esté COMPLETED no alcanza: la captura (el movimiento de plata)
  // puede quedar PENDING o DECLINED. Solo damos el pago por hecho si la
  // captura está COMPLETED y en la moneda esperada.
  const capture = data?.purchase_units?.[0]?.payments?.captures?.[0];
  const value = capture?.amount?.value;
  if (
    data?.status === "COMPLETED" &&
    capture?.status === "COMPLETED" &&
    capture.amount?.currency_code === CHECKOUT_CURRENCY &&
    value
  ) {
    return { status: "COMPLETED", capturedAmount: Number(value) };
  }
  return {
    status:
      capture?.status === "PENDING" || capture?.status === "DECLINED"
        ? capture.status
        : "FAILED",
    capturedAmount: null,
    reason: capture?.status_details?.reason ?? capture?.status ?? data?.status,
  };
}
