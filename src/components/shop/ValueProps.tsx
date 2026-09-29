import type { SiteContent, TextField } from "@/lib/site-content/fields";
import { Reveal } from "@/components/ui/Reveal";
import { EditableText } from "@/components/site-editor/EditableText";

const items = [
  { n: "01", title: "values.1Title", detail: "values.1Detail" },
  { n: "02", title: "values.2Title", detail: "values.2Detail" },
  { n: "03", title: "values.3Title", detail: "values.3Detail" },
  { n: "04", title: "values.4Title", detail: "values.4Detail" },
] as const satisfies { n: string; title: TextField; detail: TextField }[];

export function ValueProps({
  whatsappUrl,
  content,
}: {
  whatsappUrl?: string;
  content: SiteContent;
}) {
  const { text } = content;
  const t = (field: TextField) => <EditableText field={field} value={text[field]} />;

  return (
    <section className="bg-bone-dark">
      <div className="container-page py-16 sm:py-20">
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <Reveal key={item.n} delay={i * 90}>
              <p className="headline text-accent-deep text-xs">{item.n}</p>
              <h3 className="headline text-ink mt-3 text-lg">{t(item.title)}</h3>
              <p className="text-ink-muted mt-2 text-sm leading-relaxed">{t(item.detail)}</p>
            </Reveal>
          ))}
        </div>

        {whatsappUrl && (
          <Reveal delay={200}>
            <div className="border-ink/12 mt-14 flex flex-wrap items-center justify-between gap-4 border-t pt-8">
              <p className="text-ink-soft text-sm">{t("values.whatsappText")}</p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="eyebrow text-ink link-underline hover:text-accent-deep transition-colors"
              >
                <EditableText field="values.whatsappCta" value={text["values.whatsappCta"]} popover />
              </a>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
