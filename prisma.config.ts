import { defineConfig } from "prisma/config";

process.loadEnvFile?.();

export default defineConfig({
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  schema: "prisma/schema.prisma",
});
