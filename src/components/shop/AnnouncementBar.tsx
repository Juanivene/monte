import { prisma } from "@/lib/prisma";
import { pick, type Locale } from "@/i18n";
import { Marquee } from "@/components/ui/Marquee";

export async function AnnouncementBar({ lang }: { lang: Locale }) {
  const legends = await prisma.legend.findMany({
    where: { group: "ANNOUNCEMENT" },
    orderBy: { order: "asc" },
  });
  if (legends.length === 0) return null;

  return (
    <div className="bg-night text-paper/80">
      <Marquee
        items={legends.map((l) => pick(lang, l.text, l.textEn))}
        className="eyebrow py-2.5 text-[0.625rem]"
        speed="42s"
      />
    </div>
  );
}
