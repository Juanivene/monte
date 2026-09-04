"use client";

import { useTheme } from "next-themes";
import { useHydrated } from "@/lib/use-hydrated";

/**
 * Sol/luna que alterna claro ↔ oscuro. `resolvedTheme` (a diferencia de
 * `theme`) ya viene resuelto contra la preferencia del sistema, así que el
 * ícono siempre refleja lo que se está viendo, no solo lo que se eligió.
 *
 * `useHydrated` evita el mismatch de hidratación: en el servidor no hay
 * forma de saber el tema, así que el primer render de cliente tiene que
 * arrancar igual que el del servidor (botón "vacío") y recién ahí mostrar
 * el ícono correcto.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useHydrated();

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={isDark ? "Modo claro" : "Modo oscuro"}
      className={`border-ink/15 hover:border-ink flex h-10 w-10 shrink-0 items-center justify-center border transition-colors ${className}`}
    >
      {mounted && (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="h-4 w-4"
        >
          {isDark ? (
            <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
          ) : (
            <>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
            </>
          )}
        </svg>
      )}
    </button>
  );
}
