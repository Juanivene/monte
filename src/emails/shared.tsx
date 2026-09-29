import { Column, Row, Section, Text } from "@react-email/components";
import { formatPrice } from "@/lib/money";
import { getDictionary, type Locale } from "@/i18n";

export type EmailOrderItem = {
  productName: string;
  colorName: string | null;
  size: string;
  quantity: number;
  unitPrice: number;
};

export function ItemsTable({
  items,
  total,
  lang = "es",
}: {
  items: EmailOrderItem[];
  total: number;
  /** El mail al admin va siempre en español; el del comprador, en su idioma. */
  lang?: Locale;
}) {
  const t = getDictionary(lang).emails;
  return (
    <Section style={{ marginTop: 16, marginBottom: 16 }}>
      {items.map((item, idx) => (
        <Row key={idx} style={{ paddingBottom: 8 }}>
          <Column>
            <Text style={{ margin: 0, fontSize: 14 }}>
              {t.itemLine(
                item.quantity,
                `${item.productName}${item.colorName ? ` (${item.colorName})` : ""}`,
                item.size,
              )}
            </Text>
          </Column>
          <Column align="right">
            <Text style={{ margin: 0, fontSize: 14 }}>
              {formatPrice(item.unitPrice * item.quantity, lang)}
            </Text>
          </Column>
        </Row>
      ))}
      <Row style={{ borderTop: "1px solid #e5e5e5", paddingTop: 8, marginTop: 8 }}>
        <Column>
          <Text style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{t.total}</Text>
        </Column>
        <Column align="right">
          <Text style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>
            {formatPrice(total, lang)}
          </Text>
        </Column>
      </Row>
    </Section>
  );
}

export const container = {
  maxWidth: 480,
  margin: "0 auto",
  padding: "32px 24px",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
};
