import { Body, Head, Heading, Html, Preview, Text } from "@react-email/components";
import { container } from "./shared";

export type NotifiableOrderStatus = "CONFIRMADO" | "ENVIADO" | "ENTREGADO" | "CANCELADO";

export const STATUS_COPY: Record<NotifiableOrderStatus, { subject: string; message: string }> = {
  CONFIRMADO: {
    subject: "Tu pedido fue confirmado",
    message: "Confirmamos tu pedido y ya lo estamos preparando.",
  },
  ENVIADO: {
    subject: "Tu pedido está en camino",
    message: "Despachamos tu pedido. Te vamos a avisar por WhatsApp cualquier novedad del envío.",
  },
  ENTREGADO: {
    subject: "Tu pedido fue entregado",
    message: "Tu pedido figura como entregado. ¡Esperamos que lo disfrutes!",
  },
  CANCELADO: {
    subject: "Tu pedido fue cancelado",
    message: "Tu pedido fue cancelado. Si creés que es un error, escribinos por WhatsApp.",
  },
};

type Props = {
  buyerName: string;
  orderShortId: string;
  status: NotifiableOrderStatus;
};

export default function OrderStatusUpdate({ buyerName, orderShortId, status }: Props) {
  const copy = STATUS_COPY[status];
  return (
    <Html>
      <Head />
      <Preview>
        {copy.subject} (#{orderShortId})
      </Preview>
      <Body style={{ backgroundColor: "#ffffff" }}>
        <div style={container}>
          <Heading style={{ fontSize: 20, marginBottom: 4 }}>Hola, {buyerName}</Heading>
          <Text style={{ color: "#525252", fontSize: 14 }}>
            {copy.message} Pedido <strong>#{orderShortId}</strong>.
          </Text>

          <Text style={{ fontSize: 12, color: "#a3a3a3", marginTop: 24 }}>
            Si tenés alguna duda, respondé este email o escribinos por WhatsApp.
          </Text>
        </div>
      </Body>
    </Html>
  );
}
