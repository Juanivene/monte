import type { Metadata, Viewport } from "next";
import { Inter, Archivo } from "next/font/google";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "Monte";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const description =
  "Indumentaria de diseño independiente. Buzos, remeras y accesorios hechos en Tucumán, en tiradas cortas.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — Indumentaria de diseño independiente`,
    template: `%s · ${siteName}`,
  },
  description,
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName,
    title: siteName,
    description,
    images: [
      {
        url: "/lookbook/trio-muro.png",
        width: 1179,
        height: 1565,
        alt: siteName,
      },
    ],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f3ed" },
    { media: "(prefers-color-scheme: dark)", color: "#131210" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning: next-themes fija data-theme en <html> con un
    // script que corre antes de hidratar, así que el atributo del servidor
    // (que no lo tiene) y el del cliente difieren a propósito.
    <html
      lang="es"
      suppressHydrationWarning
      className={`${inter.variable} ${archivo.variable} h-full antialiased`}
    >
      <body className="bg-bone text-ink flex min-h-full flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

