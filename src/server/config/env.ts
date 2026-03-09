import "server-only";

import { z } from "zod";

const envSchema = z.object({
  APP_URL: z.string().url().default("http://localhost:3000"),
  AUTH_ACCESS_TTL_MINUTES: z.coerce.number().int().positive().default(30),
  AUTH_REFRESH_TTL_HOURS: z.coerce.number().int().positive().default(12),
  AUTH_SECRET: z.string().min(32).default("replace-with-a-32-byte-secret"),
  DATABASE_URL: z.string().min(1).optional(),
  REDIS_URL: z.string().min(1).optional(),
  EMAIL_FROM: z.string().email().optional(),
  SMS_SENDER_ID: z.string().min(1).optional(),
});

export const env = envSchema.parse({
  APP_URL: process.env.APP_URL ?? "http://localhost:3000",
  AUTH_ACCESS_TTL_MINUTES: process.env.AUTH_ACCESS_TTL_MINUTES ?? 30,
  AUTH_REFRESH_TTL_HOURS: process.env.AUTH_REFRESH_TTL_HOURS ?? 12,
  AUTH_SECRET:
    process.env.AUTH_SECRET ?? "replace-with-a-32-byte-secret-demo-only",
  DATABASE_URL: process.env.DATABASE_URL,
  REDIS_URL: process.env.REDIS_URL,
  EMAIL_FROM: process.env.EMAIL_FROM,
  SMS_SENDER_ID: process.env.SMS_SENDER_ID,
});
