import { formatPrice } from "./money";
import { MOCK_MODE } from "./mock/config";

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

export function buildOrderWhatsAppLink(params: {
  orderId: string;
  buyerName: string;
  items: WhatsAppOrderItem[];
  total: number;
}) {
  const number = getWhatsAppNumber();
  if (!number) {
    throw new Error("Falta la variable de entorno WHATSAPP_NUMBER");
  }

  const lines = [
    `Hola! Soy ${params.buyerName}, acabo de hacer el pedido #${params.orderId.slice(-8).toUpperCase()}:`,
    "",
    ...params.items.map((item) => {
      const color = item.colorName ? ` (${item.colorName})` : "";
      return `• ${item.quantity}x ${item.productName}${color} - Talle ${item.size} - ${formatPrice(
        item.unitPrice,
      )} c/u`;
    }),
    "",
    `Total: ${formatPrice(params.total)}`,
    "",
    "Quería coordinar el pago y el envío. ¡Gracias!",
  ];

  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${number}?text=${text}`;
}

/**
 * Link de contacto genérico (consultas de talle, disponibilidad, etc.).
 * Devuelve null si todavía no se configuró WHATSAPP_NUMBER, así la UI
 * simplemente no muestra el CTA en vez de romperse.
 */
export function buildContactWhatsAppLink(message?: string): string | null {
  const number = getWhatsAppNumber();
  if (!number) return null;

  const text = encodeURIComponent(
    message ?? "¡Hola! Estaba mirando la tienda y quería hacerles una consulta.",
  );
  return `https://wa.me/${number}?text=${text}`;
}
