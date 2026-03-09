import "server-only";

import type { SessionUser } from "@/server/auth/types";
import { prisma } from "@/server/db/prisma";
import { formatDisplayName } from "@/server/scheduling/read-model";

export async function createCrisisEvent(input: {
  user: SessionUser;
  severity: "LOW" | "MEDIUM" | "HIGH";
  notes?: string;
}) {
  const event = await prisma.crisisEvent.create({
    data: {
      clientId: input.user.id,
      severity: input.severity,
      notes: input.notes,
    },
  });

  return { id: event.id, createdAt: event.createdAt.toISOString() };
}

export async function listCrisisEvents(limit = 50) {
  const events = await prisma.crisisEvent.findMany({
    include: { client: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return events.map((e) => ({
    id: e.id,
    clientName: formatDisplayName(e.client.user),
    date: e.createdAt.toISOString(),
    severity: e.severity,
    followUp: e.followUpStatus.toLowerCase() as "pending" | "scheduled" | "completed",
    notes: e.notes ?? "",
  }));
}

export async function getCrisisStats() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [total, pending, high] = await Promise.all([
    prisma.crisisEvent.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.crisisEvent.count({
      where: {
        followUpStatus: { not: "COMPLETED" },
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
    prisma.crisisEvent.count({
      where: {
        severity: "HIGH",
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
  ]);

  return { total, pending, high };
}
