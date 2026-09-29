import { Body, Head, Heading, Html, Preview, Text } from "@react-email/components";
import { getDictionary, type Locale } from "@/i18n";
import { container } from "./shared";

export type NotifiableOrderStatus = "CONFIRMADO" | "ENVIADO" | "ENTREGADO" | "CANCELADO";

export function isNotifiableStatus(status: string): status is NotifiableOrderStatus {
  return Object.hasOwn(getDictionary("es").emails.status, status);
}

/** Asunto y mensaje de cada estado, en el idioma del pedido. */
export function statusCopy(lang: Locale, status: NotifiableOrderStatus) {
  return getDictionary(lang).emails.status[status];
}

type Props = {
  lang: Locale;
  buyerName: string;
  orderShortId: string;
  status: NotifiableOrderStatus;
};

export default function OrderStatusUpdate({ lang, buyerName, orderShortId, status }: Props) {
  const t = getDictionary(lang).emails;
  const copy = statusCopy(lang, status);
  return (
    <Html lang={lang}>
      <Head />
      <Preview>
        {copy.subject} (#{orderShortId})
      </Preview>
      <Body style={{ backgroundColor: "#ffffff" }}>
        <div style={container}>
          <Heading style={{ fontSize: 20, marginBottom: 4 }}>{t.hello(buyerName)}</Heading>
          <Text style={{ color: "#525252", fontSize: 14 }}>
            {copy.message} {t.orderRef(orderShortId)}
          </Text>

          <Text style={{ fontSize: 12, color: "#a3a3a3", marginTop: 24 }}>{t.questions}</Text>
        </div>
      </Body>
    </Html>
  );
}
