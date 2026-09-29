import type { Metadata, Viewport } from "next";
import { DarkReaderBridge } from "@/components/theme/DarkReaderBridge";
import { RootDocument } from "@/components/RootDocument";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "Monte";

export const metadata: Metadata = {
  title: { default: `Admin · ${siteName}`, template: `%s · ${siteName}` },
  robots: { index: false },
};

// viewport-fit=cover: la barra de pestañas de abajo llega hasta el borde en
// teléfonos con home indicator, y se corre con env(safe-area-inset-bottom).
export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f3ed" },
    { media: "(prefers-color-scheme: dark)", color: "#131210" },
  ],
};

/** Root layout del admin (la tienda tiene el suyo en app/[lang]). Siempre en español. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RootDocument lang="es">
      <div className="admin-shell min-h-screen bg-neutral-50">
        <DarkReaderBridge />
        {children}
      </div>
    </RootDocument>
  );
}
