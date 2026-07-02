import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { __prisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.__prisma = prisma;

/**
 * Run a DB operation but never let a database outage take the whole
 * request down — analysis still works, only persistence degrades.
 */
export async function safeDb<T>(op: () => Promise<T>): Promise<T | null> {
  try {
    return await op();
  } catch (error) {
    console.error("[mmr-oracle] database unavailable, continuing without persistence:", error);
    return null;
  }
}
