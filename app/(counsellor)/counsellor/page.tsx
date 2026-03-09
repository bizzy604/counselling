import { Calendar, Clock3, FileText, TrendingUp, Users } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Notice } from "@/components/ui/Notice";
import { getSessionUser } from "@/server/auth/session";
import {
  formatServiceTypeLabel,
  getCounsellorDashboardSnapshot,
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

export default async function CounsellorDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getSessionUser();

  if (!user) {
    return null;
  }

  const snapshot = await getCounsellorDashboardSnapshot(user);
  const params = await searchParams;
  const notice = readSearchParam(params.notice);
  const tone = readSearchParam(params.tone) === "error" ? "error" : "success";
  const scheduledAppointments = snapshot.appointments.filter(
    (a) => a.status === "SCHEDULED",
  );
  const nextAppointment = scheduledAppointments[0];

  return (
    <>
      {notice ? <Notice tone={tone}>{notice}</Notice> : null}

      {/* ── KPI stat cards ── */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-caption text-[var(--text-secondary)]">Active caseload</p>
            <Users aria-hidden="true" className="text-[var(--text-brand)]" size={18} />
          </div>
          <p className="mt-3 font-display text-4xl text-[var(--text-primary)]">
            {snapshot.caseload}
          </p>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-caption text-[var(--text-secondary)]">Scheduled sessions</p>
            <Calendar aria-hidden="true" className="text-[var(--text-brand)]" size={18} />
          </div>
          <p className="mt-3 font-display text-4xl text-[var(--text-primary)]">
            {scheduledAppointments.length}
          </p>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-caption text-[var(--text-secondary)]">Open booking slots</p>
            <Clock3 aria-hidden="true" className="text-[var(--text-brand)]" size={18} />
          </div>
          <p className="mt-3 font-display text-4xl text-[var(--text-primary)]">
            {snapshot.nextOpenSlots.length}
          </p>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-caption text-[var(--text-secondary)]">Next appointment</p>
            <TrendingUp aria-hidden="true" className="text-[var(--text-brand)]" size={18} />
          </div>
          <p className="mt-3 text-label text-[var(--text-primary)]">
            {nextAppointment
              ? dateTimeFormatter.format(new Date(nextAppointment.scheduledAt))
              : "—"}
          </p>
        </Card>
      </section>

      {/* ── Main content grid ── */}
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        {/* Upcoming appointments */}
        <Card
          aside={<Users aria-hidden="true" className="text-[var(--text-secondary)]" size={18} />}
          title="Upcoming appointments"
        >
          {snapshot.appointments.length === 0 ? (
            <p className="text-body-sm text-[var(--text-secondary)]">
              No appointments scheduled yet.
            </p>
          ) : (
            <div className="space-y-3">
              {snapshot.appointments.slice(0, 6).map((appointment) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] p-4"
                  key={appointment.id}
                >
                  <div className="min-w-0">
                    <p className="text-label text-[var(--text-primary)]">
                      {appointment.clientName}
                    </p>
                    <p className="text-body-sm text-[var(--text-secondary)]">
                      {formatServiceTypeLabel(appointment.serviceType)} ·{" "}
                      {dateTimeFormatter.format(new Date(appointment.scheduledAt))}
                    </p>
                  </div>
                  <Badge
                    variant={
                      appointment.status === "SCHEDULED"
                        ? "active"
                        : appointment.status === "ATTENDED"
                          ? "complete"
                          : "inactive"
                    }
                  >
                    {appointment.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Right column */}
        <div className="grid gap-6 content-start">
          {/* Open slots */}
          <Card
            aside={
              <Clock3 aria-hidden="true" className="text-[var(--text-secondary)]" size={18} />
            }
            title="Next open slots"
          >
            {snapshot.nextOpenSlots.length === 0 ? (
              <p className="text-body-sm text-[var(--text-secondary)]">
                All slots are currently booked.
              </p>
            ) : (
              <div className="space-y-2">
                {snapshot.nextOpenSlots.slice(0, 5).map((slot) => (
                  <div
                    className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] px-4 py-3"
                    key={slot.startsAt}
                  >
                    <p className="text-label text-[var(--text-primary)]">
                      {dateTimeFormatter.format(new Date(slot.startsAt))}
                    </p>
                    <p className="text-body-sm text-[var(--text-secondary)]">60-minute slot</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Quick links */}
          <Card
            aside={
              <FileText aria-hidden="true" className="text-[var(--text-secondary)]" size={18} />
            }
            title="Quick actions"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] p-4 text-label text-[var(--text-primary)] transition hover:border-[var(--border-brand)]"
                href="/counsellor/calendar"
              >
                View calendar →
              </Link>
              <Link
                className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] p-4 text-label text-[var(--text-primary)] transition hover:border-[var(--border-brand)]"
                href="/counsellor/notes"
              >
                Session notes →
              </Link>
              <Link
                className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] p-4 text-label text-[var(--text-primary)] transition hover:border-[var(--border-brand)]"
                href="/counsellor/clients"
              >
                View clients →
              </Link>
              <Link
                className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] p-4 text-label text-[var(--text-primary)] transition hover:border-[var(--border-brand)]"
                href="/counsellor/settings"
              >
                Availability settings →
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </>
  );
}
