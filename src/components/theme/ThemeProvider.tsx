"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Un solo toggle claro/oscuro para todo el sitio (tienda + admin). Usa el
 * atributo `data-theme` en <html> — coincide con el `@custom-variant dark`
 * y la paleta oscura definidos en globals.css. `next-themes` se encarga de
 * inyectar el script que fija el atributo antes del primer paint (sin eso,
 * se ve un flash del tema equivocado en cada carga).
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
