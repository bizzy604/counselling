import { AlertTriangle, BarChart3, Calendar, ClipboardList, TrendingUp, Users } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Notice } from "@/components/ui/Notice";
import { getSessionUser } from "@/server/auth/session";
import {
  formatRequestSourceLabel,
  formatServiceTypeLabel,
  getAdminDashboardSnapshot,
} from "@/server/scheduling/service";

const dateTimeFormatter = new Intl.DateTimeFormat("en-KE", {
  dateStyle: "medium",
  timeStyle: "short",
});

function readSearchParam(value: string | string[] | undefined, fallback = "") {
  if (typeof value === "string") {
    return value;
  }

  return fallback;
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getSessionUser();

  if (!user) {
    return null;
  }

  const snapshot = await getAdminDashboardSnapshot(user);
  const params = await searchParams;
  const notice = readSearchParam(params.notice);
  const tone = readSearchParam(params.tone) === "error" ? "error" : "success";
  const urgentCount = snapshot.queue.filter((r) => r.urgency !== "ROUTINE").length;

  return (
    <>
      {notice ? <Notice tone={tone}>{notice}</Notice> : null}

      {/* ── KPI stat cards ── */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-caption text-[var(--text-secondary)]">Pending requests</p>
            <ClipboardList aria-hidden="true" className="text-[var(--text-brand)]" size={18} />
          </div>
          <p className="mt-3 font-display text-4xl text-[var(--text-primary)]">
            {snapshot.queue.length}
          </p>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-caption text-[var(--text-secondary)]">Urgent items</p>
            <AlertTriangle aria-hidden="true" className="text-[var(--text-brand)]" size={18} />
          </div>
          <p className="mt-3 font-display text-4xl text-[var(--text-primary)]">
            {urgentCount}
          </p>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-caption text-[var(--text-secondary)]">Available counsellors</p>
            <Users aria-hidden="true" className="text-[var(--text-brand)]" size={18} />
          </div>
          <p className="mt-3 font-display text-4xl text-[var(--text-primary)]">
            {snapshot.counsellors.length}
          </p>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-caption text-[var(--text-secondary)]">Scheduled appointments</p>
            <Calendar aria-hidden="true" className="text-[var(--text-brand)]" size={18} />
          </div>
          <p className="mt-3 font-display text-4xl text-[var(--text-primary)]">
            {snapshot.scheduledAppointments.length}
          </p>
        </Card>
      </section>

      {/* ── Main content grid ── */}
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        {/* Pending queue preview */}
        <Card
          aside={
            <Link
              className="text-body-sm text-[var(--text-brand)] transition hover:underline"
              href="/admin/crisis"
            >
              View all →
            </Link>
          }
          title="Assignment queue"
        >
          {snapshot.queue.length === 0 ? (
            <p className="text-body-sm text-[var(--text-secondary)]">
              No pending requests in the queue.
            </p>
          ) : (
            <div className="space-y-3">
              {snapshot.queue.slice(0, 5).map((request) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] p-4"
                  key={request.id}
                >
                  <div className="min-w-0">
                    <p className="text-label text-[var(--text-primary)]">
                      {request.clientName}
                    </p>
                    <p className="text-body-sm text-[var(--text-secondary)]">
                      {formatRequestSourceLabel(request.source)} ·{" "}
                      {formatServiceTypeLabel(request.serviceType)}
                    </p>
                  </div>
                  <Badge variant={request.urgency === "ROUTINE" ? "pending" : "crisis"}>
                    {request.urgency}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Right column */}
        <div className="grid gap-6 content-start">
          {/* Counsellor capacity */}
          <Card
            aside={
              <BarChart3 aria-hidden="true" className="text-[var(--text-secondary)]" size={18} />
            }
            title="Counsellor capacity"
          >
            {snapshot.counsellors.length === 0 ? (
              <p className="text-body-sm text-[var(--text-secondary)]">
                No counsellors registered yet.
              </p>
            ) : (
              <div className="space-y-3">
                {snapshot.counsellors.map((counsellor) => (
                  <div
                    className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] p-4"
                    key={counsellor.id}
                  >
                    <div className="min-w-0">
                      <p className="text-label text-[var(--text-primary)]">
                        {counsellor.title}
                      </p>
                      <p className="text-body-sm text-[var(--text-secondary)]">
                        Caseload {counsellor.activeCaseload} / {counsellor.maxCaseload} ·{" "}
                        {counsellor.specialisations.join(", ")}
                      </p>
                    </div>
                    <Badge variant={counsellor.openSlots > 0 ? "active" : "inactive"}>
                      {counsellor.openSlots} open
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Upcoming appointments */}
          <Card
            aside={
              <Calendar aria-hidden="true" className="text-[var(--text-secondary)]" size={18} />
            }
            title="Upcoming appointments"
          >
            {snapshot.scheduledAppointments.length === 0 ? (
              <p className="text-body-sm text-[var(--text-secondary)]">
                No appointments scheduled.
              </p>
            ) : (
              <div className="space-y-2">
                {snapshot.scheduledAppointments.slice(0, 5).map((appointment) => (
                  <div
                    className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] px-4 py-3"
                    key={appointment.id}
                  >
                    <p className="text-label text-[var(--text-primary)]">
                      {appointment.clientName} — {appointment.counsellorName}
                    </p>
                    <p className="text-body-sm text-[var(--text-secondary)]">
                      {formatServiceTypeLabel(appointment.serviceType)} ·{" "}
                      {dateTimeFormatter.format(new Date(appointment.scheduledAt))}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Quick links */}
          <Card
            aside={
              <TrendingUp aria-hidden="true" className="text-[var(--text-secondary)]" size={18} />
            }
            title="Quick actions"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] p-4 text-label text-[var(--text-primary)] transition hover:border-[var(--border-brand)]"
                href="/admin/analytics"
              >
                Analytics →
              </Link>
              <Link
                className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] p-4 text-label text-[var(--text-primary)] transition hover:border-[var(--border-brand)]"
                href="/admin/users"
              >
                Manage users →
              </Link>
              <Link
                className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] p-4 text-label text-[var(--text-primary)] transition hover:border-[var(--border-brand)]"
                href="/admin/content"
              >
                Content library →
              </Link>
              <Link
                className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] p-4 text-label text-[var(--text-primary)] transition hover:border-[var(--border-brand)]"
                href="/admin/reports"
              >
                Reports →
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </>
  );
}
