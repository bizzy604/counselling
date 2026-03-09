import "server-only";

import type { Role } from "@/server/auth/types";
import { prisma } from "@/server/db/prisma";

export type AuditEvent = {
  actorId?: string;
  actorRole?: Role;
  eventType: string;
  id: string;
  ipAddress: string;
  metadata?: Record<string, string>;
  occurredAt: string;
  outcome: "SUCCESS" | "FAILURE";
};

export function recordAuditEvent(event: Omit<AuditEvent, "id" | "occurredAt">) {
  void prisma.auditLog.create({
    data: {
      action: event.eventType,
      ipAddress: event.ipAddress || "127.0.0.1",
      metadata: {
        actorRole: event.actorRole ?? null,
        outcome: event.outcome,
        ...(event.metadata ?? {}),
      },
      targetId: crypto.randomUUID(),
      targetTable: "runtime",
      userId: event.actorId ?? "00000000-0000-4000-8000-000000000000",
    },
  });
}

export async function listRecentAuditEvents(limit = 50): Promise<AuditEvent[]> {
  const rows = await prisma.auditLog.findMany({
    orderBy: {
      occurredAt: "desc",
    },
    take: limit,
  });

  return rows.map((row) => ({
    actorId: row.userId,
    eventType: row.action,
    id: row.id.toString(),
    ipAddress: row.ipAddress ?? "",
    metadata:
      row.metadata && typeof row.metadata === "object"
        ? (row.metadata as Record<string, string>)
        : undefined,
    occurredAt: row.occurredAt.toISOString(),
    outcome:
      row.metadata &&
      typeof row.metadata === "object" &&
      "outcome" in row.metadata &&
      row.metadata.outcome === "FAILURE"
        ? "FAILURE"
        : "SUCCESS",
  }));
}
