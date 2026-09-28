import { prisma } from "@/lib/prisma";
import { LegendManager } from "@/components/admin/LegendManager";

export default async function AdminLegendsPage() {
  const [announcement, hero] = await Promise.all([
    prisma.legend.findMany({ where: { group: "ANNOUNCEMENT" }, orderBy: { order: "asc" } }),
    prisma.legend.findMany({ where: { group: "HERO" }, orderBy: { order: "asc" } }),
  ]);

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-neutral-900">Leyendas</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Los textos de las dos cintas que se desplazan en la tienda. Los cambios se ven al
        instante, sin necesidad de deploy.
      </p>

      <div className="mt-6 space-y-6">
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
