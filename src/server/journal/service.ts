import "server-only";

import type { SessionUser } from "@/server/auth/types";
import { prisma } from "@/server/db/prisma";

export async function createJournalEntry(input: {
  user: SessionUser;
  prompt: string;
  body: string;
}) {
  const entry = await prisma.journalEntry.create({
    data: {
      clientId: input.user.id,
      prompt: input.prompt,
      body: input.body,
    },
  });

  return {
    id: entry.id,
    prompt: entry.prompt,
    body: entry.body,
    createdAt: entry.createdAt.toISOString(),
  };
}

export async function listJournalEntries(user: SessionUser, limit = 20) {
  const entries = await prisma.journalEntry.findMany({
    where: { clientId: user.id },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return entries.map((e) => ({
    id: e.id,
    prompt: e.prompt,
    body: e.body,
    createdAt: e.createdAt.toISOString(),
  }));
}
