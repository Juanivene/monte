import { lookbookStrip } from "@/lib/lookbook";
import { Reveal } from "@/components/ui/Reveal";
import { LookbookStrip } from "@/components/shop/LookbookStrip";

export function Lookbook() {
  return (
    <section id="lookbook" className="scroll-mt-24 py-20 sm:py-28">
      <div className="container-page">
        <Reveal>
          <div className="border-ink/12 flex flex-wrap items-end justify-between gap-4 border-b pb-6">
            <div>
              <p className="eyebrow text-ink-muted">Lookbook</p>
              <h2 className="headline mt-3 text-4xl sm:text-5xl lg:text-6xl">
                De la torre
                <br />a la orilla
              </h2>
            </div>
            <p className="text-ink-muted max-w-xs text-sm leading-relaxed">
              Las mismas prendas en hormigón porteño y en arena. Deslizá para ver toda la
              temporada.
            </p>
          </div>
        </Reveal>
      </div>

      {/* Tira horizontal: sangra hasta el borde derecho para que se note que sigue */}
      <div className="mt-10">
        <LookbookStrip shots={lookbookStrip} />
      </div>
    </section>
  );
}
