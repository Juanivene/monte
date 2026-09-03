import { Body, Head, Heading, Html, Preview, Text } from "@react-email/components";
import { container, ItemsTable, type EmailOrderItem } from "./shared";

type Props = {
  orderShortId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  items: EmailOrderItem[];
  total: number;
  shippingSummary: string;
};

export default function NewOrderAdmin({
  orderShortId,
  buyerName,
  buyerEmail,
  buyerPhone,
  items,
  total,
  shippingSummary,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>Nuevo pedido #{orderShortId} de {buyerName}</Preview>
      <Body style={{ backgroundColor: "#ffffff" }}>
        <div style={container}>
          <Heading style={{ fontSize: 20, marginBottom: 4 }}>Nuevo pedido #{orderShortId}</Heading>
          <Text style={{ fontSize: 14 }}>
            <strong>{buyerName}</strong>
            <br />
            {buyerEmail} · {buyerPhone}
          </Text>

          <ItemsTable items={items} total={total} />

          <Text style={{ fontSize: 13, color: "#525252" }}>
            <strong>Envío a:</strong> {shippingSummary}
          </Text>
        </div>
      </Body>
    </Html>
  );
}
