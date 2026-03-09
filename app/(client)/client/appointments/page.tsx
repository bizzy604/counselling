import { Calendar, Clock3 } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Notice } from "@/components/ui/Notice";
import { getSessionUser } from "@/server/auth/session";
import { formatServiceTypeLabel, listAppointmentsForUser } from "@/server/scheduling/service";

const dateTimeFormatter = new Intl.DateTimeFormat("en-KE", {
  dateStyle: "medium",
  timeStyle: "short",
});

function readSearchParam(value: string | string[] | undefined, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

const statusVariant: Record<string, "active" | "inactive" | "pending" | "crisis"> = {
  SCHEDULED: "active",
  ATTENDED: "inactive",
  CANCELLED: "crisis",
  NO_SHOW: "pending",
};

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getSessionUser();
  if (!user) return null;

  const appointments = await listAppointmentsForUser(user);
  const params = await searchParams;
  const notice = readSearchParam(params.notice);
  const tone = readSearchParam(params.tone) === "error" ? "error" : "success";

  const upcoming = appointments.filter((a) => a.status === "SCHEDULED");
  const past = appointments.filter((a) => a.status !== "SCHEDULED");

  return (
    <>
      {notice ? <Notice tone={tone}>{notice}</Notice> : null}

      <header className="mb-2">
        <h1 className="text-h2 text-[var(--text-primary)]">My Appointments</h1>
        <p className="text-body mt-1 text-[var(--text-secondary)]">
          View upcoming and past counselling sessions.
        </p>
      </header>

      <Card
        aside={<Calendar aria-hidden className="text-[var(--text-secondary)]" size={18} />}
        title="Upcoming"
      >
        {upcoming.length === 0 ? (
          <p className="text-body text-[var(--text-tertiary)]">No upcoming appointments.</p>
        ) : (
          <div className="space-y-4">
            {upcoming.map((a) => (
              <div
                className="flex items-center justify-between rounded-[20px] border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] p-4"
                key={a.id}
              >
                <div>
                  <p className="text-label text-[var(--text-primary)]">
                    {formatServiceTypeLabel(a.serviceType)}
                  </p>
                  <p className="text-body-sm mt-1 flex items-center gap-1 text-[var(--text-secondary)]">
                    <Clock3 aria-hidden size={14} />
                    {dateTimeFormatter.format(new Date(a.scheduledAt))}
                  </p>
                  <p className="text-body-sm mt-1 text-[var(--text-secondary)]">
                    with {a.counsellorName}
                  </p>
                </div>
                <Badge variant={statusVariant[a.status] ?? "inactive"}>{a.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Past sessions">
        {past.length === 0 ? (
          <p className="text-body text-[var(--text-tertiary)]">No past sessions yet.</p>
        ) : (
          <div className="space-y-3">
            {past.map((a) => (
              <div
                className="flex items-center justify-between rounded-[var(--radius-lg)] border border-[var(--border-subtle)] p-4"
                key={a.id}
              >
                <div>
                  <p className="text-label text-[var(--text-primary)]">
                    {formatServiceTypeLabel(a.serviceType)}
                  </p>
                  <p className="text-body-sm mt-1 text-[var(--text-secondary)]">
                    {dateTimeFormatter.format(new Date(a.scheduledAt))} &middot; {a.counsellorName}
                  </p>
                </div>
                <Badge variant={statusVariant[a.status] ?? "inactive"}>{a.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
