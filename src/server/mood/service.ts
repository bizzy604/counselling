import "server-only";

import type { SessionUser } from "@/server/auth/types";
import { prisma } from "@/server/db/prisma";

export async function createMoodEntry(input: {
  user: SessionUser;
  value: number;
  note?: string;
}) {
  const entry = await prisma.moodEntry.create({
    data: {
      clientId: input.user.id,
      value: input.value,
      note: input.note,
    },
  });

  return {
    id: entry.id,
    value: entry.value,
    note: entry.note,
    createdAt: entry.createdAt.toISOString(),
  };
}

export async function listMoodEntries(user: SessionUser, days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const entries = await prisma.moodEntry.findMany({
    where: {
      clientId: user.id,
      createdAt: { gte: since },
    },
    orderBy: { createdAt: "asc" },
  });

  return entries.map((e) => ({
    date: e.createdAt.toISOString().slice(0, 10),
    value: e.value,
  }));
}
