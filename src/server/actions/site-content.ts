"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { deleteR2Images } from "@/lib/r2";
import { requireAdmin } from "@/lib/require-admin";
import { HOME_CONTENT_KEY } from "@/lib/site-content/get";
import type { ContentOverrides } from "@/lib/site-content/fields";
import { parseOverrides, validateOverrides } from "@/lib/site-content/validation";

export type SiteContentResult = { ok: true } | { ok: false; error: string };

const DB_ERROR = "No se pudo guardar: la base de datos no respondió. Probá de nuevo en un rato.";

function asJson(overrides: ContentOverrides): Prisma.InputJsonValue {
  return overrides as Prisma.InputJsonValue;
}

function imageUrls(overrides: ContentOverrides): string[] {
  return Object.values(overrides.image ?? {}).flatMap((img) => (img?.url ? [img.url] : []));
}

/** Fotos del borrador y de lo publicado tal como están ahora en la base. */
async function readStoredImageUrls(): Promise<string[]> {
  const row = await prisma.siteContent.findUnique({ where: { key: HOME_CONTENT_KEY } });
  if (!row) return [];
  return [...imageUrls(parseOverrides(row.draft)), ...imageUrls(parseOverrides(row.published))];
}

/**
 * Después de guardar: borra del bucket las fotos que estaban antes y ya no
 * aparecen ni en el borrador ni en lo publicado. Se vuelve a leer la fila (en
 * vez de confiar en lo que se acaba de escribir) por si otro autoguardado
 * llegó en el medio.
 */
async function deleteReplacedImages(before: string[]) {
  if (before.length === 0) return;
  try {
    const inUse = new Set(await readStoredImageUrls());
    await deleteR2Images(before.filter((url) => !inUse.has(url)));
  } catch (error) {
    console.error("[site-content] no se pudieron limpiar las fotos viejas", error);
  }
}

/** Guarda el borrador de la preview. No toca lo que ve el cliente. */
export async function saveSiteDraft(input: unknown): Promise<SiteContentResult> {
  await requireAdmin();
  const parsed = validateOverrides(input);
  if (!parsed.ok) return parsed;

  let before: string[];
  try {
    before = await readStoredImageUrls();
    await prisma.siteContent.upsert({
      where: { key: HOME_CONTENT_KEY },
      create: { key: HOME_CONTENT_KEY, draft: asJson(parsed.data) },
      update: { draft: asJson(parsed.data) },
    });
  } catch (error) {
    console.error("[site-content] saveSiteDraft", error);
    return { ok: false, error: DB_ERROR };
  }
  await deleteReplacedImages(before);
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

  let before: string[];
  try {
    before = await readStoredImageUrls();
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
  // Las fotos que se reemplazaron respecto de lo que estaba publicado.
  await deleteReplacedImages(before);

  // El footer vive en el layout de la tienda: se revalida todo el árbol.
  revalidatePath("/[lang]", "layout");
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
      // Las fotos subidas en el borrador que se descarta.
      await deleteReplacedImages(imageUrls(parseOverrides(row.draft)));
    }
    return { ok: true, published };
  } catch (error) {
    console.error("[site-content] discardSiteDraft", error);
    return { ok: false, error: DB_ERROR };
  }
}
