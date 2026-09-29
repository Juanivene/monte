import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n";
import { languageAlternates } from "@/i18n/seo";
import { getPublishedContent } from "@/lib/site-content/get";
import { HomeView } from "@/components/shop/HomeView";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return { alternates: languageAlternates(lang, "/") };
}

export default async function HomePage({ params, searchParams }: PageProps<"/[lang]">) {
  const [{ lang }, { categoria }] = await Promise.all([params, searchParams]);
  if (!hasLocale(lang)) notFound();

  const content = await getPublishedContent(lang);
  return (
    <HomeView
      lang={lang}
      categoria={typeof categoria === "string" ? categoria : undefined}
      content={content}
    />
  );
}
