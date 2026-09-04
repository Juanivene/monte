"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export function WhatsAppRedirect({ whatsappUrl }: { whatsappUrl: string }) {
  useEffect(() => {
    // best-effort: si el navegador bloquea el popup, queda el botón de abajo como respaldo
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }, [whatsappUrl]);

  return (
    <div className="border-ink/12 mt-10 border p-6 text-center sm:p-8">
      <p className="eyebrow text-ink-muted">Último paso</p>
      <p className="text-ink-soft mx-auto mt-3 max-w-sm text-sm leading-relaxed">
        Abrimos WhatsApp con el resumen listo para enviar. Si no se abrió solo, tocá acá.
      </p>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-block w-full sm:w-auto"
      >
        <Button size="lg" className="w-full sm:w-auto">
          Continuar por WhatsApp
        </Button>
      </a>
    </div>
  );
}
