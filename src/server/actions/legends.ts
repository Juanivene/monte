"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { legendSchema, type LegendInput } from "@/lib/validations";
import type { LegendGroup } from "@prisma/client";

export type ActionResult = { ok: true } | { ok: false; error: string };

function revalidateShop() {
  // La barra de anuncios vive en el layout de la tienda y la cinta del hero
  // en "/": revalidamos todo el árbol para que ambas queden al día.
  revalidatePath("/[lang]", "layout");
}

export async function createLegend(input: LegendInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = legendSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const order = await prisma.legend.count({ where: { group: parsed.data.group } });
  await prisma.legend.create({
    data: {
      group: parsed.data.group as LegendGroup,
      text: parsed.data.text,
      textEn: parsed.data.textEn || null,
      order,
    },
  });

  revalidateShop();
  return { ok: true };
}

export async function updateLegendText(
  id: string,
  input: { text: string; textEn: string },
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = legendSchema.pick({ text: true, textEn: true }).safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  await prisma.legend.update({
    where: { id },
    data: { text: parsed.data.text, textEn: parsed.data.textEn || null },
  });
  revalidateShop();
  return { ok: true };
}

export async function deleteLegend(id: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.legend.delete({ where: { id } });
  revalidateShop();
  return { ok: true };
}

export async function moveLegend(id: string, direction: "up" | "down"): Promise<ActionResult> {
  await requireAdmin();

  const current = await prisma.legend.findUnique({ where: { id } });
  if (!current) return { ok: false, error: "Leyenda no encontrada" };

  const siblings = await prisma.legend.findMany({
    where: { group: current.group },
    orderBy: { order: "asc" },
  });
  const index = siblings.findIndex((l) => l.id === id);
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= siblings.length) {
    return { ok: true };
  }

  const target = siblings[targetIndex];
  await prisma.$transaction([
    prisma.legend.update({ where: { id: current.id }, data: { order: target.order } }),
    prisma.legend.update({ where: { id: target.id }, data: { order: current.order } }),
  ]);

  revalidateShop();
  return { ok: true };
}
