"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { HOME_CONTENT_KEY } from "@/lib/site-content/get";
import type { ContentOverrides } from "@/lib/site-content/fields";
import { parseOverrides, validateOverrides } from "@/lib/site-content/validation";

export type SiteContentResult = { ok: true } | { ok: false; error: string };

const DB_ERROR = "No se pudo guardar: la base de datos no respondió. Probá de nuevo en un rato.";

function asJson(overrides: ContentOverrides): Prisma.InputJsonValue {
  return overrides as Prisma.InputJsonValue;
}

/** Guarda el borrador de la preview. No toca lo que ve el cliente. */
export async function saveSiteDraft(input: unknown): Promise<SiteContentResult> {
  await requireAdmin();
  const parsed = validateOverrides(input);
  if (!parsed.ok) return parsed;

  try {
    await prisma.siteContent.upsert({
      where: { key: HOME_CONTENT_KEY },
      create: { key: HOME_CONTENT_KEY, draft: asJson(parsed.data) },
      update: { draft: asJson(parsed.data) },
    });
  } catch (error) {
    console.error("[site-content] saveSiteDraft", error);
    return { ok: false, error: DB_ERROR };
  }
  return { ok: true };
}

/**
 * Publica lo que se manda (el estado actual del editor, no lo último que se
 * llegó a autoguardar, para no depender de que el autoguardado haya terminado).
 */
export async function publishSiteContent(input: unknown): Promise<SiteContentResult> {
  await requireAdmin();
  const parsed = validateOverrides(input);
  if (!parsed.ok) return parsed;

  try {
    await prisma.siteContent.upsert({
      where: { key: HOME_CONTENT_KEY },
      create: {
        key: HOME_CONTENT_KEY,
        draft: asJson(parsed.data),
        published: asJson(parsed.data),
      },
      update: { draft: asJson(parsed.data), published: asJson(parsed.data) },
    });
  } catch (error) {
    console.error("[site-content] publishSiteContent", error);
    return { ok: false, error: DB_ERROR };
  }

  // El footer vive en el layout de la tienda: se revalida todo el árbol.
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Tira el borrador y vuelve a lo publicado. Devuelve lo publicado para el editor. */
export async function discardSiteDraft(): Promise<
  { ok: true; published: ContentOverrides } | { ok: false; error: string }
> {
  await requireAdmin();

  try {
    const row = await prisma.siteContent.findUnique({ where: { key: HOME_CONTENT_KEY } });
    const published = parseOverrides(row?.published);
    if (row) {
      await prisma.siteContent.update({
        where: { key: HOME_CONTENT_KEY },
        data: { draft: asJson(published) },
      });
    }
    return { ok: true, published };
  } catch (error) {
    console.error("[site-content] discardSiteDraft", error);
    return { ok: false, error: DB_ERROR };
  }
}
