import { Body, Head, Heading, Html, Preview, Text } from "@react-email/components";
import { getDictionary, type Locale } from "@/i18n";
import { container, ItemsTable, type EmailOrderItem } from "./shared";

type Props = {
  lang: Locale;
  buyerName: string;
  orderShortId: string;
  items: EmailOrderItem[];
  total: number;
  shippingSummary: string;
};

export default function OrderConfirmationBuyer({
  lang,
  buyerName,
  orderShortId,
  items,
  total,
  shippingSummary,
}: Props) {
  const t = getDictionary(lang).emails;
  return (
    <Html lang={lang}>
      <Head />
      <Preview>{t.confirmationSubject(orderShortId)}</Preview>
      <Body style={{ backgroundColor: "#ffffff" }}>
        <div style={container}>
          <Heading style={{ fontSize: 20, marginBottom: 4 }}>{t.confirmationTitle(buyerName)}</Heading>
          <Text style={{ color: "#525252", fontSize: 14 }}>{t.confirmationBody(orderShortId)}</Text>

          <ItemsTable items={items} total={total} lang={lang} />

          <Text style={{ fontSize: 13, color: "#525252" }}>
            <strong>{t.shipTo}</strong> {shippingSummary}
          </Text>

          <Text style={{ fontSize: 12, color: "#a3a3a3", marginTop: 24 }}>{t.questions}</Text>
        </div>
      </Body>
    </Html>
  );
}
