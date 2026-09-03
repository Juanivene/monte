import { formatPrice } from "./money";

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
  const number = process.env.WHATSAPP_NUMBER;
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
