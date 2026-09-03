import { Body, Head, Heading, Html, Preview, Text } from "@react-email/components";
import { container, ItemsTable, type EmailOrderItem } from "./shared";

type Props = {
  buyerName: string;
  orderShortId: string;
  items: EmailOrderItem[];
  total: number;
  shippingSummary: string;
};

export default function OrderConfirmationBuyer({
  buyerName,
  orderShortId,
  items,
  total,
  shippingSummary,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>Recibimos tu pedido #{orderShortId}</Preview>
      <Body style={{ backgroundColor: "#ffffff" }}>
        <div style={container}>
          <Heading style={{ fontSize: 20, marginBottom: 4 }}>¡Gracias por tu pedido, {buyerName}!</Heading>
          <Text style={{ color: "#525252", fontSize: 14 }}>
            Recibimos tu pedido <strong>#{orderShortId}</strong>. Te vamos a contactar por
            WhatsApp para coordinar el pago y el envío.
          </Text>

          <ItemsTable items={items} total={total} />

          <Text style={{ fontSize: 13, color: "#525252" }}>
            <strong>Envío a:</strong> {shippingSummary}
          </Text>

          <Text style={{ fontSize: 12, color: "#a3a3a3", marginTop: 24 }}>
            Si tenés alguna duda, respondé este email o escribinos por WhatsApp.
          </Text>
        </div>
      </Body>
    </Html>
  );
}
