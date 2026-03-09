import { Calendar, Clock3 } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { getSessionUser } from "@/server/auth/session";
import { formatServiceTypeLabel, listAppointmentsForUser } from "@/server/scheduling/service";

const dateTimeFormatter = new Intl.DateTimeFormat("en-KE", {
  dateStyle: "full",
  timeStyle: "short",
});

const dayFormatter = new Intl.DateTimeFormat("en-KE", { weekday: "long", month: "short", day: "numeric" });

function groupByDate(appointments: { scheduledAt: string; [key: string]: unknown }[]) {
  const groups = new Map<string, typeof appointments>();
  for (const a of appointments) {
    const dateKey = a.scheduledAt.slice(0, 10);
    const list = groups.get(dateKey) ?? [];
    list.push(a);
    groups.set(dateKey, list);
  }
  return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
}

export default async function CounsellorCalendarPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const appointments = await listAppointmentsForUser(user);
  const upcoming = appointments
    .filter((a) => a.status === "SCHEDULED")
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));

  const grouped = groupByDate(upcoming);

  return (
    <>
      <header className="mb-2">
        <h1 className="text-h2 text-[var(--text-primary)]">Calendar</h1>
        <p className="text-body mt-1 text-[var(--text-secondary)]">
          Your upcoming appointments grouped by day.
        </p>
      </header>

      {grouped.length === 0 ? (
        <Card>
          <p className="text-body text-[var(--text-tertiary)]">No upcoming appointments.</p>
        </Card>
      ) : (
        grouped.map(([dateKey, dayAppts]) => (
          <Card key={dateKey}>
            <h2 className="text-h4 mb-4 text-[var(--text-primary)]">
              {dayFormatter.format(new Date(dateKey + "T00:00:00"))}
            </h2>
            <div className="space-y-3">
              {(dayAppts as typeof appointments).map((a) => (
                <div
                  className="flex items-center justify-between rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] p-4"
                  key={a.id}
                >
                  <div>
                    <p className="text-label text-[var(--text-primary)]">{a.clientName}</p>
                    <p className="text-body-sm mt-1 text-[var(--text-secondary)]">
                      {formatServiceTypeLabel(a.serviceType)}
                    </p>
                    <p className="text-body-sm mt-1 flex items-center gap-1 text-[var(--text-tertiary)]">
                      <Clock3 aria-hidden size={14} />
                      {dateTimeFormatter.format(new Date(a.scheduledAt))}
                    </p>
                  </div>
                  <Badge variant="active">Scheduled</Badge>
                </div>
              ))}
            </div>
          </Card>
        ))
      )}
    </>
  );
}
