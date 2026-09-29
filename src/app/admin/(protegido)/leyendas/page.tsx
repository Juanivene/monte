import { prisma } from "@/lib/prisma";
import { LegendManager } from "@/components/admin/LegendManager";
import { PageHeader } from "@/components/admin/PageHeader";

export default async function AdminLegendsPage() {
  const [announcement, hero] = await Promise.all([
    prisma.legend.findMany({ where: { group: "ANNOUNCEMENT" }, orderBy: { order: "asc" } }),
    prisma.legend.findMany({ where: { group: "HERO" }, orderBy: { order: "asc" } }),
  ]);

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Leyendas"
        subtitle="Los textos de las dos cintas que se desplazan en la tienda, en español y en inglés. Los cambios se ven al instante, sin necesidad de deploy."
      />

      <div className="space-y-4 sm:space-y-6">
        <LegendManager
          group="ANNOUNCEMENT"
          title="Barra de anuncios (arriba del header)"
          description="Ej: envíos, tiradas cortas, cambios, hecho en Tucumán..."
          initialLegends={announcement}
        />
        <LegendManager
          group="HERO"
          title="Cinta del hero (abajo del banner principal del home)"
          description="Ej: Monte, Miami, First Drop 2026..."
          initialLegends={hero}
        />
      </div>
    </div>
  );
}
