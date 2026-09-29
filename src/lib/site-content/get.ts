import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { resolveContent, type ContentOverrides, type SiteContent } from "./fields";
import { parseOverrides } from "./validation";

/** Clave de la única fila que existe hoy. */
export const HOME_CONTENT_KEY = "home";

/**
 * Contenido publicado del home, para la tienda. Si la base falla (o la tabla
 * todavía no existe) se muestra el contenido por defecto en vez de romper la
 * página. `cache` para que el layout (footer) y la página compartan la
 * consulta dentro del mismo request.
 */
export const getPublishedContent = cache(async (): Promise<SiteContent> => {
  try {
    const row = await prisma.siteContent.findUnique({
      where: { key: HOME_CONTENT_KEY },
      select: { published: true },
    });
    return resolveContent(parseOverrides(row?.published));
  } catch (error) {
    console.error("[site-content] no se pudo leer el contenido, se muestra el default", error);
    return resolveContent({});
  }
});

/** Borrador y publicado por separado, para el editor. */
export async function getEditableContent(): Promise<{
  ok: boolean;
  draft: ContentOverrides;
  published: ContentOverrides;
}> {
  try {
    const row = await prisma.siteContent.findUnique({ where: { key: HOME_CONTENT_KEY } });
    const published = parseOverrides(row?.published);
    const draft = row?.draft != null ? parseOverrides(row.draft) : published;
    return { ok: true, draft, published };
  } catch (error) {
    console.error("[site-content] no se pudo leer el contenido del editor", error);
    return { ok: false, draft: {}, published: {} };
  }
}
