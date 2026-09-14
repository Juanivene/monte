import "server-only";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
//todo remover
import { MOCK_MODE } from "@/lib/mock/config";
import { mockPrisma } from "@/lib/mock/mock-prisma";

neonConfig.webSocketConstructor = ws;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Falta la variable de entorno DATABASE_URL");
  }
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

// En modo mock no se toca Neon ni hace falta DATABASE_URL: ver src/lib/mock/.
export const prisma: PrismaClient = MOCK_MODE
  ? mockPrisma
  : (globalForPrisma.prisma ?? createPrismaClient());

if (!MOCK_MODE && process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

