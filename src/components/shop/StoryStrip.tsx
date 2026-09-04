import Image from "next/image";
import { shots } from "@/lib/lookbook";
import { Reveal } from "@/components/ui/Reveal";

export function StoryStrip() {
  return (
    <section className="container-page py-20 sm:py-28">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
        <Reveal className="order-2 lg:order-1">
          <p className="eyebrow text-ink-muted">Sobre Monte</p>
          <h2 className="headline mt-4 text-4xl sm:text-5xl">
            Poca cantidad,
            <br />
            mucha prenda
          </h2>
          <div className="text-ink-soft mt-6 space-y-4 text-[0.95rem] leading-relaxed">
            <p>
              Monte nació entre las montañas de nuestros valles tcucumanos y terminó de tomar forma en
              la costa. De ahí salen los colores:  el verde del monte, el azul
              del agua y la arena.
            </p>
            <p>
              Cortamos y cosemos en talleres locales. Cada diseño se produce en tiradas cortas, con
              telas pesadas y moldería oversize pensada para durar más de una temporada.
            </p>
          </div>

          <ul className="mt-9 grid gap-6 sm:grid-cols-3">
            <Fact title="Frisa 400g" detail="Algodón peinado" />
            <Fact title="Moldería oversize" detail="Del XS al XXL" />
            <Fact title="Ojales metálicos" detail="Aplicados a mano" />
          </ul>
        </Reveal>

        <Reveal delay={120} className="order-1 lg:order-2">
          {/*
            La columna chica estira hasta el alto de la foto grande (que sí tiene
            aspect ratio propio) y se parte en dos filas iguales.
          */}
          <div className="grid grid-cols-5 gap-3 sm:gap-4">
            <div className="bg-bone-dark relative col-span-3 aspect-3/4 overflow-hidden">
              <Image
                src={shots.buzoTealTorre03.src}
                alt={shots.buzoTealTorre03.alt}
                placeholder="blur"
                fill
                sizes="(min-width: 1024px) 28vw, 55vw"
                className="object-cover"
              />
            </div>

            <div className="col-span-2 grid grid-rows-2 gap-3 sm:gap-4">
              <div className="bg-bone-dark relative overflow-hidden">
                <Image
                  src={shots.remerasArena.src}
                  alt={shots.remerasArena.alt}
                  placeholder="blur"
                  fill
                  sizes="(min-width: 1024px) 19vw, 38vw"
                  className="object-cover"
                />
              </div>
              <div className="bg-bone-dark relative overflow-hidden">
                <Image
                  src={shots.buzoNegroPorton.src}
                  alt={shots.buzoNegroPorton.alt}
                  placeholder="blur"
                  fill
                  sizes="(min-width: 1024px) 19vw, 38vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Fact({ title, detail }: { title: string; detail: string }) {
  return (
    <li className="border-ink/20 border-t pt-4">
      <p className="headline text-ink text-sm">{title}</p>
      <p className="text-ink-muted mt-1 text-xs">{detail}</p>
    </li>
  );
}
