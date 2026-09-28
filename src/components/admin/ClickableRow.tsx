"use client";

import { useRouter } from "next/navigation";

/**
 * <tr> que navega a `href` al hacer click en cualquier parte de la fila.
 * Los clicks sobre links/botones de adentro (ej. el tacho) se dejan pasar,
 * y ctrl/cmd/click del medio abren en pestaña nueva como un link normal.
 * Para teclado y lectores de pantalla, la fila igual tiene un <Link> real.
 */
export function ClickableRow({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  function open(e: React.MouseEvent<HTMLTableRowElement>, newTab: boolean) {
    if ((e.target as HTMLElement).closest("a, button, [role=tooltip]")) return;
    if (window.getSelection()?.toString()) return; // estaba seleccionando texto
    if (newTab) window.open(href, "_blank");
    else router.push(href);
  }

  return (
    <tr
      className={`cursor-pointer ${className ?? ""}`}
      onClick={(e) => open(e, e.metaKey || e.ctrlKey)}
      onAuxClick={(e) => e.button === 1 && open(e, true)}
    >
      {children}
    </tr>
  );
}
