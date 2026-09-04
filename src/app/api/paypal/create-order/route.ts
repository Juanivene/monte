import { NextResponse } from "next/server";
import { checkoutItemSchema } from "@/lib/validations";
import { computeOrderItems } from "@/server/order-service";
import { createPaypalOrder } from "@/lib/paypal";
import { z } from "zod";

const bodySchema = z.object({
  items: z.array(checkoutItemSchema).min(1, "El carrito está vacío"),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
        { status: 400 },
      );
    }

    const computed = await computeOrderItems(parsed.data.items);
    if (!computed.ok) {
      return NextResponse.json({ error: computed.error }, { status: 400 });
    }

    const paypalOrderId = await createPaypalOrder(computed.total);
    return NextResponse.json({ paypalOrderId });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error creando la orden de PayPal" },
      { status: 400 },
    );
  }
}
