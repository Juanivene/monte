import type { Metadata, Viewport } from "next";
import { DarkReaderBridge } from "@/components/theme/DarkReaderBridge";

export const metadata: Metadata = {
  title: "Admin",
};

// viewport-fit=cover: la barra de pestañas de abajo llega hasta el borde en
// teléfonos con home indicator, y se corre con env(safe-area-inset-bottom).
export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell min-h-screen bg-neutral-50">
      <DarkReaderBridge />
      {children}
    </div>
  );
}
