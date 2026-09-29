import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { localePath, locales } from "@/i18n/config";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");

// Lee los productos de la base en cada pedido, no en el build.
export const dynamic = "force-dynamic";

/**
 * Cada página aparece una vez por idioma, con la otra versión enlazada como
 * alternativa: así Google indexa /es y /en por separado y sabe que son la
 * misma página.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let products: { slug: string; updatedAt: Date }[] = [];
  try {
    products = await prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });
  } catch (error) {
    // Sin base, al menos el home en los dos idiomas.
    console.error("[sitemap] no se pudieron leer los productos", error);
  }

  const pages: { path: string; lastModified?: Date }[] = [
    { path: "/" },
    ...products.map((p) => ({ path: `/productos/${p.slug}`, lastModified: p.updatedAt })),
  ];

  return pages.flatMap(({ path, lastModified }) => {
    const languages = Object.fromEntries(
      locales.map((l) => [l, `${siteUrl}${localePath(l, path)}`]),
    );
    return locales.map((lang) => ({
      url: `${siteUrl}${localePath(lang, path)}`,
      lastModified,
      alternates: { languages },
    }));
  });
}
