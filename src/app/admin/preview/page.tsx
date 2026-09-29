import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/admin/AdminNav";
import { getSession } from "@/lib/session";
import { hasLocale, pick } from "@/i18n";
import { LocaleProvider } from "@/i18n/client";
import { resolveContent } from "@/lib/site-content/fields";
import { getEditableContent } from "@/lib/site-content/get";
import { AnnouncementBar } from "@/components/shop/AnnouncementBar";
import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { HomeView } from "@/components/shop/HomeView";
import { SiteEditorProvider } from "@/components/site-editor/SiteEditorProvider";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Editar home",
};

/**
 * La home tal cual la ve el cliente, con los textos y fotos editables en el
 * lugar. Queda fuera de (protegido) para no heredar el ancho acotado del
 * admin (la barra del admin sí se muestra, arriba de la tienda). El proxy
 * (matcher /admin/:path*) la protege igual; el chequeo de acá es por las dudas.
 *
 * ?lang=en muestra (y edita) la versión en inglés; por defecto, español.
 */
export default async function PreviewPage({ searchParams }: PageProps<"/admin/preview">) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const { lang: rawLang } = await searchParams;
  const lang = typeof rawLang === "string" && hasLocale(rawLang) ? rawLang : "es";

  const [categories, stored] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { slug: true, name: true, nameEn: true },
    }),
    getEditableContent(),
  ]);
  const localizedCategories = categories.map((c) => ({
    slug: c.slug,
    name: pick(lang, c.name, c.nameEn),
  }));
  const content = resolveContent(stored.draft, lang);

  return (
    <div className="bg-bone text-ink flex min-h-screen flex-col">
      <SiteEditorProvider
        lang={lang}
        initialDraft={stored.draft}
        initialPublished={stored.published}
        dbOk={stored.ok}
      >
        <AdminNav email={session.email} />
        {/* Solo la tienda va en el idioma elegido: la barra del admin sigue en español. */}
        <LocaleProvider lang={lang}>
          <AnnouncementBar lang={lang} />
          {/*
            El wrapper mide lo mismo que el header, así su `sticky` no tiene
            recorrido: si se pegara arriba taparía la barra del admin, que es la
            que tiene que quedar siempre a mano.
          */}
          <div>
            <Suspense fallback={<div className="h-18" />}>
              <Header categories={localizedCategories} />
            </Suspense>
          </div>
          <main className="flex-1">
            <HomeView lang={lang} content={content} />
          </main>
          <Footer lang={lang} categories={localizedCategories} content={content} />
        </LocaleProvider>
      </SiteEditorProvider>
      <Toaster
        position="top-center"
        toastOptions={{
          classNames: {
            toast: "!rounded-xs !border-ink/10 !bg-bone !text-ink !font-sans",
            description: "!text-ink-muted",
          },
        }}
      />
    </div>
  );
}
