import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("Falta la variable de entorno DATABASE_URL");
}

const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });

async function main() {
  const email = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Definí ADMIN_SEED_EMAIL y ADMIN_SEED_PASSWORD en .env antes de seedear",
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await prisma.admin.upsert({
    where: { email: email.toLowerCase() },
    update: { passwordHash },
    create: { email: email.toLowerCase(), passwordHash },
  });

  console.log(`Admin listo: ${admin.email}`);

  await seedDefaultLegends();
}

/** Solo carga leyendas por defecto la primera vez (si el grupo ya tiene alguna, no toca nada). */
async function seedDefaultLegends() {
  const announcementCount = await prisma.legend.count({ where: { group: "ANNOUNCEMENT" } });
  if (announcementCount === 0) {
    const texts = [
      "Hecho en Tucumán",
      "Envíos a todo el país",
      "Tiradas cortas y numeradas",
      "Cambios dentro de los 30 días",
      "Coordinamos pago y envío por WhatsApp",
    ];
    await prisma.legend.createMany({
      data: texts.map((text, order) => ({ group: "ANNOUNCEMENT" as const, text, order })),
    });
    console.log("Leyendas de la barra de anuncios cargadas.");
  }

  const heroCount = await prisma.legend.count({ where: { group: "HERO" } });
  if (heroCount === 0) {
    const texts = ["Monte", "Miami", "First Drop 2026"];
    await prisma.legend.createMany({
      data: texts.map((text, order) => ({ group: "HERO" as const, text, order })),
    });
    console.log("Leyendas del hero cargadas.");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
