import Link from "next/link";
import type { SiteContent, TextField } from "@/lib/site-content/fields";
import { getDictionary, localePath, type Locale } from "@/i18n";
import { EditableImage } from "@/components/site-editor/EditableImage";
import { EditableText } from "@/components/site-editor/EditableText";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Monte";
const whatsappNumber = process.env.WHATSAPP_NUMBER;

export function Footer({
  lang,
  categories,
  content,
}: {
  lang: Locale;
  categories: { slug: string; name: string }[];
  content: SiteContent;
}) {
  const { text, image } = content;
  const dict = getDictionary(lang);
  const t = (field: TextField) => <EditableText field={field} value={text[field]} />;

  return (
    <footer className="bg-night text-paper mt-24 sm:mt-32">
      {/* Franja editorial: foto ancha + claim */}
      <div className="relative isolate overflow-hidden">
        <EditableImage
          field="footer.bg"
          image={image["footer.bg"]}
          sizes="100vw"
          className="-z-10 object-cover opacity-35"
        />
        <div className="container-page py-20 text-center sm:py-28">
          <p className="eyebrow text-paper/60">{t("footer.eyebrow")}</p>
          <p className="headline mx-auto mt-5 max-w-3xl text-[10vw] leading-[0.92] sm:text-6xl lg:text-7xl">
            <EditableText
              field="footer.claim"
              value={text["footer.claim"]}
              accentClassName="text-accent"
            />
          </p>
        </div>
      </div>

      <div className="container-page grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="headline text-2xl">
            {siteName}
            <span className="text-accent">.</span>
          </p>
          <p className="text-paper/55 mt-4 max-w-xs text-sm leading-relaxed">
            {t("footer.brand")}
          </p>
        </div>

        <FooterColumn title={dict.footer.shop}>
          <FooterLink href={localePath(lang, "/")}>{dict.footer.allCatalog}</FooterLink>
          {categories.map((category) => (
            <FooterLink
              key={category.slug}
              href={localePath(lang, `/?categoria=${category.slug}`)}
            >
              {category.name}
            </FooterLink>
          ))}
          <FooterLink href={localePath(lang, "/#lookbook")}>{dict.footer.lookbook}</FooterLink>
        </FooterColumn>

        <FooterColumn title={dict.footer.help}>
          <FooterLink href={localePath(lang, "/carrito")}>{dict.footer.myCart}</FooterLink>
          <li className="text-paper/55 text-sm">{t("footer.help1")}</li>
          <li className="text-paper/55 text-sm">{t("footer.help2")}</li>
          <li className="text-paper/55 text-sm">{t("footer.help3")}</li>
        </FooterColumn>

        <FooterColumn title={dict.footer.follow}>
          <li>
            <a
              href={text["footer.instagram"]}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline text-paper/55 hover:text-paper text-sm transition-colors"
            >
              Instagram
            </a>
            {/* Solo se ve en el editor: botón para cambiar el link. */}
            {t("footer.instagram")}
          </li>
          {whatsappNumber && (
            <li>
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline text-paper/55 hover:text-paper text-sm transition-colors"
              >
                WhatsApp
              </a>
            </li>
          )}
        </FooterColumn>
      </div>

      <div className="border-paper/10 border-t">
        <div className="container-page text-paper/40 flex flex-col gap-2 py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <span>
            {dict.footer.rights(new Date().getFullYear(), siteName)}
          </span>
          <span className="eyebrow text-paper/30">{t("footer.madeIn")}</span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="eyebrow text-paper/40">{title}</p>
      <ul className="mt-5 space-y-3">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="link-underline text-paper/55 hover:text-paper text-sm transition-colors"
      >
        {children}
      </Link>
    </li>
  );
}

