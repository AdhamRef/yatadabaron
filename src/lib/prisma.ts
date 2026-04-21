import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";

// Guarantee DATABASE_URL is loaded regardless of how this module is imported
// (Next page-data collection, Prisma CLI, tsx, ad-hoc scripts). Try cwd first
// — fast and usually right — then fall back to a path resolved from this
// file's location, which is stable even when cwd isn't the project root.
if (!process.env.DATABASE_URL) {
  loadEnvConfig(process.cwd());
}
if (!process.env.DATABASE_URL) {
  // src/lib/prisma.ts → project root is two dirs up.
  loadEnvConfig(path.resolve(__dirname, "..", ".."));
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Check that a .env file exists at the project root and contains DATABASE_URL=..."
  );
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Pass the URL explicitly via `datasourceUrl` so Prisma doesn't need to
// re-resolve `env("DATABASE_URL")` from the schema at construction time.
// This sidesteps the "Environment variable not found: DATABASE_URL" error
// in any context where the Prisma engine's env lookup runs before Node's.
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
