import { Reveal } from "@/components/ui/Reveal";

const items = [
  {
    n: "01",
    title: "Envíos a todo el país",
    detail: "Despachamos dentro de las 24 h hábiles por correo o moto en CABA.",
  },
  {
    n: "02",
    title: "Cambios sin vueltas",
    detail: "Tenés 30 días para cambiar el talle, siempre que la prenda esté sin uso.",
  },
  {
    n: "03",
    title: "Tiradas cortas",
    detail: "Producimos poco de cada diseño. Lo que se agota rara vez vuelve.",
  },
  {
    n: "04",
    title: "Te asesoramos",
    detail: "Si dudás con el talle, escribinos y lo vemos juntos antes de comprar.",
  },
];

export function ValueProps({ whatsappUrl }: { whatsappUrl?: string }) {
  return (
    <section className="bg-bone-dark">
      <div className="container-page py-16 sm:py-20">
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <Reveal key={item.n} delay={i * 90}>
              <p className="headline text-accent-deep text-xs">{item.n}</p>
              <h3 className="headline text-ink mt-3 text-lg">{item.title}</h3>
              <p className="text-ink-muted mt-2 text-sm leading-relaxed">{item.detail}</p>
            </Reveal>
          ))}
        </div>

        {whatsappUrl && (
          <Reveal delay={200}>
            <div className="border-ink/12 mt-14 flex flex-wrap items-center justify-between gap-4 border-t pt-8">
              <p className="text-ink-soft text-sm">
                ¿Alguna duda antes de comprar? Estamos del otro lado.
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="eyebrow text-ink link-underline hover:text-accent-deep transition-colors"
              >
                Escribinos por WhatsApp →
              </a>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
