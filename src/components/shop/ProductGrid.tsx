"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

/** cuántas prendas se ven de entrada y cuántas suma el "Ver más" */
const PAGE_SIZE = 8;

/**
 * Grilla del catálogo con carga progresiva: arranca con PAGE_SIZE prendas,
 * un único "Ver más" suma otra tanda y después "Ver todos los productos"
 * despliega el resto. Las cards llegan ya renderizadas desde el server, así
 * no hay que serializar los productos (el precio es un Decimal de Prisma).
 */
export function ProductGrid({ items }: { items: React.ReactNode[] }) {
  // 0 = inicial, 1 = ya se usó "Ver más", 2 = todo desplegado
  const [step, setStep] = useState<0 | 1 | 2>(0);

  const visibleCount =
    step === 2 ? items.length : Math.min(items.length, PAGE_SIZE * (step + 1));
  const hasMore = visibleCount < items.length;

  return (
    <>
      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 xl:grid-cols-4">
        {items.slice(0, visibleCount)}
      </div>

      {hasMore && (
        <div className="mt-14 flex flex-col items-center gap-4">
          <p className="eyebrow text-ink-muted tabular-nums">
            Mostrando {visibleCount} de {items.length}
          </p>
          <Button
            variant="secondary"
            onClick={() => setStep(step === 0 ? 1 : 2)}
          >
            {step === 0 ? "Ver más" : "Ver todos los productos"}
          </Button>
        </div>
      )}
    </>
  );
}
