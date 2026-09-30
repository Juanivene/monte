import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Toaster } from "sonner";
import { prisma } from "@/lib/prisma";
import { getPublishedContent } from "@/lib/site-content/get";
import { getDictionary, hasLocale, localeTags, locales } from "@/i18n";
import { buildCategoryTree } from "@/lib/categories";
import { LocaleProvider } from "@/i18n/client";
import { RootDocument } from "@/components/RootDocument";
import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { AnnouncementBar } from "@/components/shop/AnnouncementBar";

// El header y el footer listan las categorías desde la base, así que ninguna
// ruta de la tienda puede quedar horneada en build.
// Cualquier otro valor en el primer segmento es un 404 (ver hasLocale abajo).
export const dynamic = "force-dynamic";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "Monte";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f3ed" },
    { media: "(prefers-color-scheme: dark)", color: "#131210" },
  ],
};

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang);

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${siteName} — ${t.meta.tagline}`,
      template: `%s · ${siteName}`,
    },
    description: t.meta.description,
    openGraph: {
      type: "website",
      locale: localeTags[lang].og,
      alternateLocale: locales.filter((l) => l !== lang).map((l) => localeTags[l].og),
      siteName,
      title: siteName,
      description: t.meta.description,
      images: [{ url: "/lookbook/trio-muro.png", width: 1179, height: 1565, alt: siteName }],
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function ShopLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const [categories, content] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, slug: true, name: true, nameEn: true, parentId: true },
    }),
    getPublishedContent(lang),
  ]);
  const localizedCategories = buildCategoryTree(categories, lang);

  return (
    <RootDocument lang={localeTags[lang].html}>
      <LocaleProvider lang={lang}>
        <AnnouncementBar lang={lang} />
        {/* El Header lee ?categoria para marcar el link activo, de ahí el Suspense. */}
        <Suspense fallback={<div className="h-18" />}>
          <Header categories={localizedCategories} />
        </Suspense>
        <main className="flex-1">{children}</main>
        <Footer lang={lang} categories={localizedCategories} content={content} />
        <Toaster
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast: "!rounded-xs !border-ink/10 !bg-bone !text-ink !font-sans",
              description: "!text-ink-muted",
            },
          }}
        />
      </LocaleProvider>
    </RootDocument>
  );
}
