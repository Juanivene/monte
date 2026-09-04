"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Shot } from "@/lib/lookbook";

/**
 * Tira horizontal de fotos. `overflow-x-auto` solo. Anda solo con touch
 * (el swipe ya es horizontal) o trackpad (gesto horizontal nativo); con
 * mouse en pantalla grande no hay forma de moverla, porque la scrollbar
 * está oculta y la rueda del mouse solo manda scroll vertical. Este
 * componente le suma tres formas de moverla con mouse: arrastrar,
 * flechas, y traducir la rueda vertical a desplazamiento horizontal.
 */
export function LookbookStrip({ shots }: { shots: Shot[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, scrollLeft: 0 });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const updateEdges = () => {
      const max = el.scrollWidth - el.clientWidth;
      setCanScrollPrev(el.scrollLeft > 4);
      setCanScrollNext(el.scrollLeft < max - 4);
    };

    updateEdges();
    el.addEventListener("scroll", updateEdges, { passive: true });

    // El ancho total cambia a medida que cargan las imágenes.
    const resizeObserver = new ResizeObserver(updateEdges);
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener("scroll", updateEdges);
      resizeObserver.disconnect();
    };
  }, []);

  // Rueda del mouse: mientras se pueda seguir moviendo la tira, el deltaY
  // vertical se traduce a scroll horizontal; en los bordes se deja pasar
  // el evento para que la página siga scrolleando normal.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onWheel = (event: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return;

      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      const max = el.scrollWidth - el.clientWidth;
      const atStart = el.scrollLeft <= 0;
      const atEnd = el.scrollLeft >= max;

      if ((delta < 0 && atStart) || (delta > 0 && atEnd)) return;

      event.preventDefault();
      el.scrollLeft += delta;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  function scrollByPage(direction: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: "smooth" });
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    // Solo mouse: en touch, el scroll nativo ya funciona y arrastrar
    // encima rompería el gesto (scrollLeft se movería el doble).
    if (event.pointerType !== "mouse") return;
    const el = scrollerRef.current;
    if (!el) return;

    draggingRef.current = true;
    dragStartRef.current = { x: event.clientX, scrollLeft: el.scrollLeft };
    el.setPointerCapture(event.pointerId);
    el.style.scrollSnapType = "none";
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollLeft = dragStartRef.current.scrollLeft - (event.clientX - dragStartRef.current.x);
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    const el = scrollerRef.current;
    if (!el) return;
    el.releasePointerCapture(event.pointerId);
    el.style.scrollSnapType = "";
  }

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        role="region"
        aria-label="Lookbook, desplazable horizontalmente"
        tabIndex={0}
        className="scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [touch-action:pan-x] active:cursor-grabbing sm:cursor-grab sm:gap-4 sm:px-8 xl:px-10"
      >
        {shots.map((shot, i) => (
          <figure
            key={shot.src.src}
            className="bg-bone-dark relative h-[58vh] max-h-[600px] min-h-[340px] shrink-0 snap-start overflow-hidden"
            style={{ aspectRatio: `${shot.src.width} / ${shot.src.height}` }}
          >
            <Image
              src={shot.src}
              alt={shot.alt}
              placeholder="blur"
              fill
              draggable={false}
              loading={i < 2 ? "eager" : "lazy"}
              sizes="(min-width: 640px) 45vw, 80vw"
              className="pointer-events-none object-cover transition-transform duration-1000 ease-out sm:pointer-events-auto sm:hover:scale-105"
            />
          </figure>
        ))}
        <div aria-hidden="true" className="w-1 shrink-0" />
      </div>

      <StripArrow direction="prev" visible={canScrollPrev} onClick={() => scrollByPage(-1)} />
      <StripArrow direction="next" visible={canScrollNext} onClick={() => scrollByPage(1)} />
    </div>
  );
}

function StripArrow({
  direction,
  visible,
  onClick,
}: {
  direction: "prev" | "next";
  visible: boolean;
  onClick: () => void;
}) {
  const isPrev = direction === "prev";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isPrev ? "Ver fotos anteriores" : "Ver fotos siguientes"}
      className={`bg-bone/85 text-ink absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center backdrop-blur-sm transition-opacity duration-300 hover:bg-bone lg:flex ${
        isPrev ? "left-3 sm:left-5" : "right-3 sm:right-5"
      } ${visible ? "opacity-100" : "pointer-events-none opacity-0"}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
        className={`h-4 w-4 ${isPrev ? "rotate-180" : ""}`}
      >
        <path d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}
