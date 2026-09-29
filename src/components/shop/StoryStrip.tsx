import type { SiteContent, TextField } from "@/lib/site-content/fields";
import { Reveal } from "@/components/ui/Reveal";
import { EditableImage } from "@/components/site-editor/EditableImage";
import { EditableText } from "@/components/site-editor/EditableText";

const facts = [
  { title: "story.fact1Title", detail: "story.fact1Detail" },
  { title: "story.fact2Title", detail: "story.fact2Detail" },
  { title: "story.fact3Title", detail: "story.fact3Detail" },
] as const satisfies { title: TextField; detail: TextField }[];

export function StoryStrip({ content }: { content: SiteContent }) {
  const { text, image } = content;
  const t = (field: TextField) => <EditableText field={field} value={text[field]} />;

  return (
    <section className="container-page py-20 sm:py-28">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
        <Reveal className="order-2 lg:order-1">
          <p className="eyebrow text-ink-muted">{t("story.eyebrow")}</p>
          <h2 className="headline mt-4 text-4xl sm:text-5xl">{t("story.title")}</h2>
          <div className="text-ink-soft mt-6 space-y-4 text-[0.95rem] leading-relaxed">
            <p>{t("story.p1")}</p>
            <p>{t("story.p2")}</p>
          </div>

          <ul className="mt-9 grid gap-6 sm:grid-cols-3">
            {facts.map((fact) => (
              <Fact key={fact.title} title={t(fact.title)} detail={t(fact.detail)} />
            ))}
          </ul>
        </Reveal>

        <Reveal delay={120} className="order-1 lg:order-2">
          {/*
            La columna chica estira hasta el alto de la foto grande (que sí tiene
            aspect ratio propio) y se parte en dos filas iguales.
          */}
          <div className="grid grid-cols-5 gap-3 sm:gap-4">
            <div className="bg-bone-dark relative col-span-3 aspect-3/4 overflow-hidden">
              <EditableImage
                field="story.main"
                image={image["story.main"]}
                sizes="(min-width: 1024px) 28vw, 55vw"
                className="object-cover"
              />
            </div>

            <div className="col-span-2 grid grid-rows-2 gap-3 sm:gap-4">
              <div className="bg-bone-dark relative overflow-hidden">
                <EditableImage
                  field="story.top"
                  image={image["story.top"]}
                  sizes="(min-width: 1024px) 19vw, 38vw"
                  className="object-cover"
                />
              </div>
              <div className="bg-bone-dark relative overflow-hidden">
                <EditableImage
                  field="story.bottom"
                  image={image["story.bottom"]}
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

function Fact({ title, detail }: { title: React.ReactNode; detail: React.ReactNode }) {
  return (
    <li className="border-ink/20 border-t pt-4">
      <p className="headline text-ink text-sm">{title}</p>
      <p className="text-ink-muted mt-1 text-xs">{detail}</p>
    </li>
  );
}
