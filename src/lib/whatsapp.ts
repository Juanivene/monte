import { formatPrice } from "./money";
import { MOCK_MODE } from "./mock/config";
import { getDictionary, type Locale } from "@/i18n";

//todo remover
function getWhatsAppNumber(): string | undefined {
  return process.env.WHATSAPP_NUMBER ?? (MOCK_MODE ? "5491100000000" : undefined);
}

export type WhatsAppOrderItem = {
  productName: string;
  colorName: string | null;
  size: string;
  quantity: number;
  unitPrice: number;
};

/** Mensaje que el comprador le manda a la tienda, en el idioma en que compró. */
export function buildOrderWhatsAppLink(params: {
  lang: Locale;
  orderId: string;
  buyerName: string;
  items: WhatsAppOrderItem[];
  total: number;
}) {
  const number = getWhatsAppNumber();
  if (!number) {
    throw new Error("Falta la variable de entorno WHATSAPP_NUMBER");
  }

  const t = getDictionary(params.lang).whatsapp;
  const lines = [
    t.orderIntro(params.buyerName, params.orderId.slice(-8).toUpperCase()),
    "",
    ...params.items.map((item) => {
      const color = item.colorName ? ` (${item.colorName})` : "";
      return t.orderItem(
        item.quantity,
        `${item.productName}${color}`,
        item.size,
        formatPrice(item.unitPrice, params.lang),
      );
    }),
    "",
    t.orderTotal(formatPrice(params.total, params.lang)),
    "",
    t.orderOutro,
  ];

  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${number}?text=${text}`;
}

/**
 * Link de contacto genérico (consultas de talle, disponibilidad, etc.).
 * Devuelve null si todavía no se configuró WHATSAPP_NUMBER, así la UI
 * simplemente no muestra el CTA en vez de romperse.
 */
export function buildContactWhatsAppLink(message: string): string | null {
  const number = getWhatsAppNumber();
  if (!number) return null;

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
