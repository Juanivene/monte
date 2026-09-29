import { Inter, Archivo } from "next/font/google";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import "@/app/globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

/**
 * <html> y <body> compartidos. La app tiene dos root layouts, la tienda
 * (app/[lang], con el idioma en <html lang>) y el admin (siempre en español),
 * y los dos arman el documento con esto.
 */
export function RootDocument({ lang, children }: { lang: string; children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: next-themes fija data-theme en <html> con un
    // script que corre antes de hidratar, así que el atributo del servidor
    // (que no lo tiene) y el del cliente difieren a propósito.
    //
    // data-scroll-behavior="smooth": desde Next 16, sin esto Next deja de
    // desactivar temporalmente el scroll-behavior:smooth de globals.css
    // durante una navegación normal — cualquier Link (no solo los que usan
    // #hash) terminaría animando el salto al top en vez de saltar directo.
    // Con el atributo, Next vuelve a manejarlo: instantáneo en navegación
    // de página, suave en los links con #hash (categorías, lookbook).
    <html
      lang={lang}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${archivo.variable} h-full antialiased`}
    >
      <body className="bg-bone text-ink flex min-h-full flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
