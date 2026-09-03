import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

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
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
