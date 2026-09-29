import { LOOKBOOK_FIELDS, type SiteContent, type TextField } from "@/lib/site-content/fields";
import { Reveal } from "@/components/ui/Reveal";
import { LookbookStrip } from "@/components/shop/LookbookStrip";
import { EditableText } from "@/components/site-editor/EditableText";

export function Lookbook({ content }: { content: SiteContent }) {
  const { text, image } = content;
  const t = (field: TextField) => <EditableText field={field} value={text[field]} />;

  return (
    <section id="lookbook" className="scroll-mt-24 py-20 sm:py-28">
      <div className="container-page">
        <Reveal>
          <div className="border-ink/12 flex flex-wrap items-end justify-between gap-4 border-b pb-6">
            <div>
              <p className="eyebrow text-ink-muted">{t("lookbook.eyebrow")}</p>
              <h2 className="headline mt-3 text-4xl sm:text-5xl lg:text-6xl">
                {t("lookbook.title")}
              </h2>
            </div>
            <p className="text-ink-muted max-w-xs text-sm leading-relaxed">{t("lookbook.body")}</p>
          </div>
        </Reveal>
      </div>

      {/* Tira horizontal: sangra hasta el borde derecho para que se note que sigue */}
      <div className="mt-10">
        <LookbookStrip
          items={LOOKBOOK_FIELDS.map((field) => ({ field, image: image[field] }))}
        />
      </div>
    </section>
  );
}
