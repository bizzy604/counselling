import { CalendarDays, Clock3, Save, Users } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Notice } from "@/components/ui/Notice";
import { getSessionUser } from "@/server/auth/session";
import { saveAvailabilityAction } from "@/server/scheduling/actions";
import {
  formatServiceTypeLabel,
  getCounsellorDashboardSnapshot,
} from "@/server/scheduling/service";

const weekdayLabels = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
} as const;

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
  const nextAppointment = snapshot.appointments.find(
    (appointment) => appointment.status === "SCHEDULED",
  );

  return (
    <>
      {notice ? <Notice tone={tone}>{notice}</Notice> : null}

      <section className="grid gap-4 lg:grid-cols-4">
        <Card>
          <p className="text-caption text-[var(--text-secondary)]">Active caseload</p>
          <p className="mt-3 font-display text-4xl text-[var(--text-primary)]">
            {snapshot.caseload}
          </p>
        </Card>
        <Card>
          <p className="text-caption text-[var(--text-secondary)]">Scheduled sessions</p>
          <p className="mt-3 font-display text-4xl text-[var(--text-primary)]">
            {snapshot.appointments.filter((appointment) => appointment.status === "SCHEDULED").length}
          </p>
        </Card>
        <Card>
          <p className="text-caption text-[var(--text-secondary)]">Open booking slots</p>
          <p className="mt-3 font-display text-4xl text-[var(--text-primary)]">
            {snapshot.nextOpenSlots.length}
          </p>
        </Card>
        <Card>
          <p className="text-caption text-[var(--text-secondary)]">Next appointment</p>
          <p className="mt-3 text-label text-[var(--text-primary)]">
            {nextAppointment
              ? dateTimeFormatter.format(new Date(nextAppointment.scheduledAt))
              : "No confirmed slot"}
          </p>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <Card
          aside={<Users aria-hidden="true" className="text-[var(--text-secondary)]" size={18} />}
          id="calendar"
          title="Upcoming appointments"
        >
          <div className="space-y-4">
            {snapshot.appointments.map((appointment) => (
              <div
                className="flex items-center justify-between rounded-[20px] border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] p-4"
                key={appointment.id}
              >
                <div>
                  <p className="text-label text-[var(--text-primary)]">{appointment.clientName}</p>
                  <p className="text-body-sm text-[var(--text-secondary)]">
                    {formatServiceTypeLabel(appointment.serviceType)} -{" "}
                    {dateTimeFormatter.format(new Date(appointment.scheduledAt))}
                  </p>
                </div>
                <Badge variant={appointment.status === "SCHEDULED" ? "active" : "inactive"}>
                  {appointment.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card
          aside={
            <CalendarDays
              aria-hidden="true"
              className="text-[var(--text-secondary)]"
              size={18}
            />
          }
          title="Weekly availability"
        >
          <p className="text-body-sm text-[var(--text-secondary)]">
            Changes take effect immediately in the direct booking calendar and the Admin
            assignment queue.
          </p>
          <form action={saveAvailabilityAction} className="mt-5 space-y-4">
            {snapshot.availabilityRules.map((rule) => (
              <div
                className="grid gap-3 rounded-[20px] border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]"
                key={rule.dayOfWeek}
              >
                <div>
                  <p className="text-label text-[var(--text-primary)]">
                    {weekdayLabels[rule.dayOfWeek as keyof typeof weekdayLabels]}
                  </p>
                  <p className="text-body-sm mt-1 text-[var(--text-secondary)]">
                    Recurring weekly hours
                  </p>
                </div>
                <label className="space-y-2">
                  <span className="text-body-sm text-[var(--text-secondary)]">Start</span>
                  <input
                    className="input"
                    defaultValue={rule.startTime}
                    name={`day-${rule.dayOfWeek}-start`}
                    type="time"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-body-sm text-[var(--text-secondary)]">End</span>
                  <input
                    className="input"
                    defaultValue={rule.endTime}
                    name={`day-${rule.dayOfWeek}-end`}
                    type="time"
                  />
                </label>
              </div>
            ))}
            <Button type="submit">
              <Save aria-hidden="true" size={16} />
              Save availability
            </Button>
          </form>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <Card
          aside={<Clock3 aria-hidden="true" className="text-[var(--text-secondary)]" size={18} />}
          title="Next open booking slots"
        >
          <div className="grid gap-3">
            {snapshot.nextOpenSlots.map((slot) => (
              <div
                className="rounded-[18px] border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] px-4 py-3"
                key={slot.startsAt}
              >
                <p className="text-label text-[var(--text-primary)]">
                  {dateTimeFormatter.format(new Date(slot.startsAt))}
                </p>
                <p className="text-body-sm text-[var(--text-secondary)]">
                  60-minute slot ready for direct booking or admin assignment
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card id="notes" title="Phase status">
          <p className="text-body text-[var(--text-secondary)]">
            This slice now covers the scheduling backbone: recurring availability,
            generated slots, direct bookings, and request-based assignments. Session
            notes and encrypted drafts stay for the next clinical workflow phase.
          </p>
        </Card>
      </section>
    </>
  );
}
