import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";

// Guarantee DATABASE_URL is loaded from .env* files even if this module is
// imported from a context where Next.js hasn't auto-loaded env (e.g. some
// build/CI paths or when Prisma is instantiated during page-data collection).
// Safe to call repeatedly — loadEnvConfig is idempotent.
if (!process.env.DATABASE_URL) {
  loadEnvConfig(process.cwd());
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
