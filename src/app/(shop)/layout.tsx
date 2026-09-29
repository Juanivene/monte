import { Suspense } from "react";
import { Toaster } from "sonner";
import { prisma } from "@/lib/prisma";
import { getPublishedContent } from "@/lib/site-content/get";
import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { AnnouncementBar } from "@/components/shop/AnnouncementBar";

// El header y el footer listan las categorías desde la base, así que ninguna
// ruta de la tienda puede quedar horneada en build.
export const dynamic = "force-dynamic";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const [categories, content] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { slug: true, name: true },
    }),
    getPublishedContent(),
  ]);

  return (
    <>
      <AnnouncementBar />
      {/* El Header lee ?categoria para marcar el link activo, de ahí el Suspense. */}
      <Suspense fallback={<div className="h-18" />}>
        <Header categories={categories} />
      </Suspense>
      <main className="flex-1">{children}</main>
      <Footer categories={categories} content={content} />
      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: "!rounded-xs !border-ink/10 !bg-bone !text-ink !font-sans",
            description: "!text-ink-muted",
          },
        }}
      />
    </>
  );
}
