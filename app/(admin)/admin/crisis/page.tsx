import { Shield } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { requireRole } from "@/server/auth/session";
import { listCrisisEvents, getCrisisStats } from "@/server/crisis/service";

const dateTimeFormatter = new Intl.DateTimeFormat("en-KE", {
  dateStyle: "medium",
  timeStyle: "short",
});

const severityVariant: Record<string, "crisis" | "pending" | "active"> = {
  HIGH: "crisis",
  MEDIUM: "pending",
  LOW: "active",
};

const followUpVariant: Record<string, "active" | "pending" | "inactive"> = {
  completed: "active",
  scheduled: "pending",
  pending: "inactive",
};

export default async function CrisisOversightPage() {
  await requireRole("ADMIN");
  const [crisisEvents, stats] = await Promise.all([
    listCrisisEvents(50),
    getCrisisStats(),
  ]);

  return (
    <>
      <header className="mb-2">
        <h1 className="text-h2 text-[var(--text-primary)]">Crisis Oversight</h1>
        <p className="text-body mt-1 text-[var(--text-secondary)]">
          Monitor crisis events, follow-up status, and response metrics.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <p className="text-caption text-[var(--text-secondary)]">Total events (30d)</p>
          <p className="mt-3 font-display text-4xl text-[var(--text-primary)]">{stats.total}</p>
        </Card>
        <Card>
          <p className="text-caption text-[var(--text-secondary)]">Pending follow-up</p>
          <p className="mt-3 font-display text-4xl text-[var(--text-primary)]">{stats.pending}</p>
        </Card>
        <Card>
          <p className="text-caption text-[var(--text-secondary)]">High severity</p>
          <p className="mt-3 font-display text-4xl text-[var(--jasper-500)]">{stats.high}</p>
        </Card>
      </section>

      <Card
        aside={<Shield aria-hidden className="text-[var(--text-secondary)]" size={18} />}
        title="Recent crisis events"
      >
        <div className="space-y-4">
          {crisisEvents.map((event) => (
            <div
              className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] p-4"
              key={event.id}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-label text-[var(--text-primary)]">{event.clientName}</p>
                  <p className="text-body-sm mt-1 text-[var(--text-tertiary)]">
                    {dateTimeFormatter.format(new Date(event.date))}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={severityVariant[event.severity] ?? "inactive"}>
                    {event.severity}
                  </Badge>
                  <Badge variant={followUpVariant[event.followUp] ?? "inactive"}>
                    {event.followUp}
                  </Badge>
                </div>
              </div>
              {event.notes && (
                <p className="text-body-sm mt-3 text-[var(--text-secondary)]">{event.notes}</p>
              )}
            </div>
          ))}
          {crisisEvents.length === 0 && (
            <p className="py-6 text-center text-[var(--text-tertiary)]">
              No crisis events recorded.
            </p>
          )}
        </div>
      </Card>
    </>
  );
}
