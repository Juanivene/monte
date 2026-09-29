import { NextResponse } from "next/server";
import { checkoutItemSchema } from "@/lib/validations";
import { computeOrderItems } from "@/server/order-service";
import { createPaypalOrder } from "@/lib/paypal";
import { checkoutErrorMessage, getDictionary, locales } from "@/i18n";
import { z } from "zod";

const bodySchema = z.object({
  items: z.array(checkoutItemSchema).min(1, "emptyCart"),
  locale: z.enum(locales).default("es"),
});

export async function POST(request: Request): Promise<NextResponse> {
  let lang: (typeof locales)[number] = "es";
  try {
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: checkoutErrorMessage(lang, parsed.error.issues[0]?.message) },
        { status: 400 },
      );
    }
    lang = parsed.data.locale;

    const computed = await computeOrderItems(parsed.data.items, lang);
    if (!computed.ok) {
      return NextResponse.json({ error: computed.error }, { status: 400 });
    }

    const paypalOrderId = await createPaypalOrder(computed.total);
    return NextResponse.json({ paypalOrderId });
  } catch (error) {
    console.error("[paypal] create-order", error);
    return NextResponse.json({ error: getDictionary(lang).errors.paypalStart }, { status: 400 });
  }
}
