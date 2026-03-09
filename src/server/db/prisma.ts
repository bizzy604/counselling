import "server-only";

import { PrismaClient } from "@prisma/client";

declare global {
  var __cwePrisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.__cwePrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__cwePrisma = prisma;
}
