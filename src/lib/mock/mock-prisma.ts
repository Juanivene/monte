import "server-only";
import type { PrismaClient } from "@prisma/client";
import { mockPrisma as rawMockPrisma } from "./store";
import { ensureMockSeed } from "./seed-data";

ensureMockSeed();

/**
 * Se castea a PrismaClient para que el resto del código (que importa
 * `{ prisma }` de src/lib/prisma.ts con los tipos generados por Prisma) siga
 * compilando sin cambios. La forma de los datos que devuelve coincide con lo
 * que esas páginas/acciones ya esperan (ver src/lib/mock/store.ts).
 */
export const mockPrisma = rawMockPrisma as unknown as PrismaClient;
