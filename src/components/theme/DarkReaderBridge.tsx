"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

/**
 * El admin nunca se rediseñó con los tokens de color de la tienda — son
 * ~15 archivos con clases de Tailwind (`neutral-*`, `red-*`, etc.) puestas
 * directo. Reescribirlas todas para que soporten modo oscuro es justo el
 * trabajo que se quiere evitar, así que acá se usa Dark Reader (la misma
 * librería open source de la extensión) para invertir los estilos ya
 * generados en tiempo real, sin tocar un solo componente del admin.
 *
 * Ámbito: este componente solo se importa desde el layout de /admin, así
 * que Dark Reader nunca se carga ni corre en las páginas de la tienda
 * (esas usan la paleta oscura propia, definida en globals.css).
 */
export function DarkReaderBridge() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    let cancelled = false;

    import("darkreader").then((DarkReader) => {
      if (cancelled) return;
      if (resolvedTheme === "dark") {
        DarkReader.enable({
          brightness: 100,
          contrast: 90,
          sepia: 0,
          darkSchemeBackgroundColor: "#131210",
          darkSchemeTextColor: "#f3efe6",
        });
      } else {
        DarkReader.disable();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [resolvedTheme]);

  // Al salir del todo de /admin (layout desmontado) hay que apagarlo, si no
  // el filtro se le queda pegado a la tienda al volver.
  useEffect(() => {
    return () => {
      import("darkreader").then((DarkReader) => DarkReader.disable());
    };
  }, []);

  return null;
}
