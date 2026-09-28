"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Un solo toggle claro/oscuro para todo el sitio (tienda + admin). Usa el
 * atributo `data-theme` en <html> — coincide con el `@custom-variant dark`
 * y la paleta oscura definidos en globals.css. `next-themes` se encarga de
 * inyectar el script que fija el atributo antes del primer paint (sin eso,
 * se ve un flash del tema equivocado en cada carga).
 *
 * `scriptProps`: React 19 avisa "Encountered a script tag while rendering
 * React component" cuando un componente cliente renderiza un <script>. En el
 * servidor lo dejamos como JS (así corre antes del paint); en el cliente le
 * cambiamos el type para que React no lo trate como script ejecutable. El
 * <script> de next-themes ya tiene suppressHydrationWarning.
 */
const scriptProps =
  typeof window === "undefined"
    ? undefined
    : ({ type: "application/json" } as const);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      scriptProps={scriptProps}
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
