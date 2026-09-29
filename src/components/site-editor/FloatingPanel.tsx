"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const GAP = 10;
const MARGIN = 8;

/**
 * Panel flotante pegado a un elemento de la página (arriba si hay lugar, si
 * no abajo). Va en un portal para que no lo recorte ningún `overflow-hidden`
 * de las secciones, y sigue al elemento mientras se scrollea.
 */
export function FloatingPanel({
  anchor,
  children,
  className = "",
  onDismiss,
}: {
  anchor: HTMLElement | null;
  children: React.ReactNode;
  className?: string;
  /** Click afuera del panel y del elemento. */
  onDismiss?: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!onDismiss) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || anchor?.contains(target)) return;
      onDismiss();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [anchor, onDismiss]);

  useLayoutEffect(() => {
    if (!anchor) return;
    let frame = 0;

    const update = () => {
      const panel = panelRef.current;
      if (panel) {
        const rect = anchor.getBoundingClientRect();
        const { offsetWidth: width, offsetHeight: height } = panel;
        const fitsAbove = rect.top - GAP - height > MARGIN;
        const top = fitsAbove ? rect.top - GAP - height : rect.bottom + GAP;
        const left = Math.min(
          Math.max(rect.left, MARGIN),
          window.innerWidth - width - MARGIN,
        );
        setPosition((prev) =>
          prev && prev.top === top && prev.left === left ? prev : { top, left },
        );
      }
      frame = requestAnimationFrame(update);
    };

    update();
    return () => cancelAnimationFrame(frame);
  }, [anchor]);

  return createPortal(
    <div
      ref={panelRef}
      // Mientras no se midió, invisible (así no aparece un frame en 0,0).
      style={{
        top: position?.top ?? 0,
        left: position?.left ?? 0,
        visibility: position ? "visible" : "hidden",
      }}
      className={`fixed z-60 max-w-[calc(100vw-16px)] rounded-lg bg-neutral-900 font-sans text-xs text-white normal-case tracking-normal shadow-xl ${className}`}
      // Que un click en el panel no le saque el foco al texto que se edita.
      onMouseDown={(e) => {
        if (!(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
          e.preventDefault();
        }
      }}
      // Los eventos de un portal suben por el árbol de React: sin esto, un
      // click acá llegaría al texto editable (o al link que lo envuelve).
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {children}
    </div>,
    document.body,
  );
}
