import Image from "next/image";
import { lookbookStrip } from "@/lib/lookbook";
import { Reveal } from "@/components/ui/Reveal";

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
      <div className="scrollbar-none mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 sm:gap-4 sm:px-8 xl:px-10">
        {lookbookStrip.map((shot, i) => (
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
              loading={i < 2 ? "eager" : "lazy"}
              sizes="(min-width: 640px) 45vw, 80vw"
              className="object-cover transition-transform duration-1000 ease-out hover:scale-105"
            />
          </figure>
        ))}
        <div aria-hidden="true" className="w-1 shrink-0" />
      </div>
    </section>
  );
}
