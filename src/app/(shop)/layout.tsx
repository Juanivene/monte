import { Suspense } from "react";
import { Toaster } from "sonner";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { AnnouncementBar } from "@/components/shop/AnnouncementBar";

// El header y el footer listan las categorías desde la base, así que ninguna
// ruta de la tienda puede quedar horneada en build.
export const dynamic = "force-dynamic";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { slug: true, name: true },
  });

  return (
    <>
      <AnnouncementBar />
      {/* El Header lee ?categoria para marcar el link activo, de ahí el Suspense. */}
      <Suspense fallback={<div className="h-18" />}>
        <Header categories={categories} />
      </Suspense>
      <main className="flex-1">{children}</main>
      <Footer categories={categories} />
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
