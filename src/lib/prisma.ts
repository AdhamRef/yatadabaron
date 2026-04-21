import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";

// Best-effort env loading — helps local dev, tsx scripts, and odd CWDs.
// Does NOT throw if DATABASE_URL is missing: module imports must succeed
// even during `next build`'s page-data collection on platforms like Vercel
// where build-time env may differ from runtime env.
if (!process.env.DATABASE_URL) loadEnvConfig(process.cwd());
if (!process.env.DATABASE_URL) {
  loadEnvConfig(path.resolve(__dirname, "..", ".."));
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Locally: add it to .env. On Vercel: Settings → Environment Variables."
    );
  }
  return new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

// Lazy singleton: PrismaClient is only instantiated on the first property
// access, not at module load. This means `import { prisma }` succeeds during
// `next build`'s static analysis / page-data collection even when env vars
// aren't injected into the build step. The real query-time error (if any)
// still surfaces loudly at runtime with a clear message.
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop: string | symbol) {
    const client = globalForPrisma.prisma ?? createClient();
    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
