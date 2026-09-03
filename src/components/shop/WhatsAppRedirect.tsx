"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export function WhatsAppRedirect({ whatsappUrl }: { whatsappUrl: string }) {
  useEffect(() => {
    // best-effort: si el navegador bloquea el popup, queda el botón de abajo como respaldo
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }, [whatsappUrl]);

  return (
    <div className="mt-8 text-center">
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
        <Button className="w-full sm:w-auto">Continuar por WhatsApp</Button>
      </a>
      <p className="mt-2 text-xs text-neutral-500">
        Coordiná el pago y el envío directamente con nosotros.
      </p>
    </div>
  );
}
