import { Calendar, Clock3, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Notice } from "@/components/ui/Notice";
import { getSessionUser } from "@/server/auth/session";
import {
  cancelAppointmentAction,
  createAppointmentAction,
  createCounsellingRequestAction,
} from "@/server/scheduling/actions";
import {
  formatRequestSourceLabel,
  formatServiceTypeLabel,
  getClientDashboardSnapshot,
} from "@/server/scheduling/service";
import {
  requestSources,
  serviceTypes,
  urgencyLevels,
} from "@/server/scheduling/types";

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

export default async function ClientDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getSessionUser();

  if (!user) {
    return null;
  }

  const snapshot = await getClientDashboardSnapshot(user);
  const params = await searchParams;
  const notice = readSearchParam(params.notice);
  const tone = readSearchParam(params.tone) === "error" ? "error" : "success";
  const nextAppointment = snapshot.appointments.find(
    (appointment) => appointment.status === "SCHEDULED",
  );

  return (
    <>
      {notice ? <Notice tone={tone}>{notice}</Notice> : null}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <Card className="ambient-panel overflow-hidden">
          <p className="text-overline text-[var(--text-brand)]">Booking flow</p>
          <h2 className="text-h2 mt-3 text-[var(--text-primary)]">
            Direct booking when slots are open, Admin queue when they are not.
          </h2>
          <p className="text-body mt-4 max-w-2xl text-[var(--text-secondary)]">
            This client workspace now follows the PRD split: live counsellor slots can
            be booked immediately, while waitlist and manual-assignment requests go to
            the Admin queue.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-[20px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
              <p className="text-caption text-[var(--text-secondary)]">Available counsellors</p>
              <p className="mt-2 font-display text-4xl text-[var(--text-primary)]">
                {snapshot.counsellors.length}
              </p>
            </div>
            <div className="rounded-[20px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
              <p className="text-caption text-[var(--text-secondary)]">Scheduled appointments</p>
              <p className="mt-2 font-display text-4xl text-[var(--text-primary)]">
                {snapshot.appointments.filter((appointment) => appointment.status === "SCHEDULED").length}
              </p>
            </div>
            <div className="rounded-[20px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
              <p className="text-caption text-[var(--text-secondary)]">Pending requests</p>
              <p className="mt-2 font-display text-4xl text-[var(--text-primary)]">
                {snapshot.requests.filter((request) => request.status === "PENDING_APPROVAL").length}
              </p>
            </div>
          </div>
        </Card>

        <Card title="Next confirmed session">
          {nextAppointment ? (
            <>
              <Badge variant="active">Scheduled</Badge>
              <p className="mt-4 text-h4 text-[var(--text-primary)]">
                {formatServiceTypeLabel(nextAppointment.serviceType)}
              </p>
              <p className="text-body mt-2 text-[var(--text-secondary)]">
                With {nextAppointment.counsellorName}
              </p>
              <p className="text-body mt-1 text-[var(--text-secondary)]">
                {dateTimeFormatter.format(new Date(nextAppointment.scheduledAt))}
              </p>
              <div className="mt-6 flex items-center gap-3 rounded-[20px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
                <Calendar aria-hidden="true" className="text-[var(--text-brand)]" size={18} />
                <p className="text-body-sm text-[var(--text-secondary)]">
                  Client cancellations remain available only up to 24 hours before the
                  booked slot.
                </p>
              </div>
            </>
          ) : (
            <p className="text-body text-[var(--text-secondary)]">
              No confirmed appointment yet. Use the live slot cards below or submit a
              manual counselling request.
            </p>
          )}
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <Card id="appointments" title="Direct booking">
          <div className="grid gap-4">
            {snapshot.counsellors.map((counsellor) => (
              <div
                className="rounded-[24px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5"
                key={counsellor.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-h4 text-[var(--text-primary)]">{counsellor.title}</p>
                    <p className="text-body-sm mt-1 text-[var(--text-secondary)]">
                      {counsellor.specialisations.join(" / ")}
                    </p>
                  </div>
                  <Badge variant={counsellor.openSlots > 0 ? "active" : "inactive"}>
                    {counsellor.openSlots} open slots
                  </Badge>
                </div>
                <p className="text-body-sm mt-4 text-[var(--text-secondary)]">
                  {counsellor.bio}
                </p>
                {counsellor.nextSlots.length ? (
                  <form action={createAppointmentAction} className="mt-5 space-y-4">
                    <input name="counsellorId" type="hidden" value={counsellor.id} />
                    <div className="grid gap-4 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                      <div className="space-y-2">
                        <label className="text-label block text-[var(--text-primary)]" htmlFor={`service-${counsellor.id}`}>
                          Service type
                        </label>
                        <select
                          className="input"
                          defaultValue="STRESS"
                          id={`service-${counsellor.id}`}
                          name="serviceType"
                        >
                          {serviceTypes.map((serviceType) => (
                            <option key={serviceType} value={serviceType}>
                              {formatServiceTypeLabel(serviceType)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-label block text-[var(--text-primary)]" htmlFor={`slot-${counsellor.id}`}>
                          Next open slot
                        </label>
                        <select
                          className="input"
                          id={`slot-${counsellor.id}`}
                          name="scheduledAt"
                        >
                          {counsellor.nextSlots.map((slot) => (
                            <option key={slot.startsAt} value={slot.startsAt}>
                              {dateTimeFormatter.format(new Date(slot.startsAt))}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <Button>
                      <Clock3 aria-hidden="true" size={18} />
                      Book with {counsellor.title.split(",")[0]}
                    </Button>
                  </form>
                ) : (
                  <p className="mt-5 text-body-sm text-[var(--text-secondary)]">
                    No direct slots are currently open for this counsellor.
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card
          aside={
            <Badge variant="pending">
              <ShieldCheck aria-hidden="true" size={14} />
              Admin review
            </Badge>
          }
          title="Manual counselling request"
        >
          <p className="text-body-sm text-[var(--text-secondary)]">
            Use this when you want a waitlist place, manual assignment, or a specific
            counsellor request instead of immediate self-booking.
          </p>
          <form action={createCounsellingRequestAction} className="mt-5 space-y-4">
            <div className="space-y-2">
              <label className="text-label block text-[var(--text-primary)]" htmlFor="request-service">
                Service type
              </label>
              <select className="input" defaultValue="INDIVIDUAL" id="request-service" name="serviceType">
                {serviceTypes.map((serviceType) => (
                  <option key={serviceType} value={serviceType}>
                    {formatServiceTypeLabel(serviceType)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-label block text-[var(--text-primary)]" htmlFor="request-source">
                Request path
              </label>
              <select className="input" defaultValue="WAITLIST" id="request-source" name="source">
                {requestSources
                  .filter((source) => source !== "EMPLOYER_REFERRAL" && source !== "CRISIS")
                  .map((source) => (
                    <option key={source} value={source}>
                      {formatRequestSourceLabel(source)}
                    </option>
                  ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-label block text-[var(--text-primary)]" htmlFor="request-counsellor">
                Preferred counsellor
              </label>
              <select className="input" defaultValue="" id="request-counsellor" name="preferredCounsellorId">
                <option value="">No preference</option>
                {snapshot.counsellors.map((counsellor) => (
                  <option key={counsellor.id} value={counsellor.id}>
                    {counsellor.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-label block text-[var(--text-primary)]" htmlFor="request-urgency">
                Urgency
              </label>
              <select className="input" defaultValue="ROUTINE" id="request-urgency" name="urgency">
                {urgencyLevels
                  .filter((urgency) => urgency !== "CRISIS")
                  .map((urgency) => (
                    <option key={urgency} value={urgency}>
                      {urgency.charAt(0)}{urgency.slice(1).toLowerCase()}
                    </option>
                  ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-label block text-[var(--text-primary)]" htmlFor="request-notes">
                Notes for Admin
              </label>
              <textarea
                className="input min-h-28 resize-y"
                id="request-notes"
                name="notes"
                placeholder="Preferred times, modality, or context for the assignment team."
              />
            </div>
            <Button className="w-full justify-center" type="submit">
              Submit request for review
            </Button>
          </form>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Card title="My appointments">
          <div className="space-y-4">
            {snapshot.appointments.map((appointment) => (
              <div
                className="rounded-[22px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4"
                key={appointment.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-label text-[var(--text-primary)]">
                      {formatServiceTypeLabel(appointment.serviceType)}
                    </p>
                    <p className="text-body-sm mt-1 text-[var(--text-secondary)]">
                      {appointment.counsellorName} - {dateTimeFormatter.format(new Date(appointment.scheduledAt))}
                    </p>
                  </div>
                  <Badge variant={appointment.status === "CANCELLED" ? "inactive" : "active"}>
                    {appointment.status}
                  </Badge>
                </div>
                {appointment.status === "SCHEDULED" ? (
                  <form action={cancelAppointmentAction} className="mt-4">
                    <input name="appointmentId" type="hidden" value={appointment.id} />
                    <Button size="sm" variant="secondary">
                      Cancel booking
                    </Button>
                  </form>
                ) : null}
              </div>
            ))}
          </div>
        </Card>

        <Card title="My requests">
          <div className="space-y-4">
            {snapshot.requests.map((request) => (
              <div
                className="rounded-[22px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4"
                key={request.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-label text-[var(--text-primary)]">
                      {formatServiceTypeLabel(request.serviceType)}
                    </p>
                    <p className="text-body-sm mt-1 text-[var(--text-secondary)]">
                      {formatRequestSourceLabel(request.source)} - {dateTimeFormatter.format(new Date(request.requestedAt))}
                    </p>
                  </div>
                  <Badge
                    variant={
                      request.status === "REJECTED"
                        ? "inactive"
                        : request.status === "ASSIGNED"
                          ? "complete"
                          : "pending"
                    }
                  >
                    {request.status.replace("_", " ")}
                  </Badge>
                </div>
                {request.preferredCounsellorName ? (
                  <p className="text-body-sm mt-3 text-[var(--text-secondary)]">
                    Preferred counsellor: {request.preferredCounsellorName}
                  </p>
                ) : null}
                {request.notes ? (
                  <p className="text-body-sm mt-2 text-[var(--text-secondary)]">{request.notes}</p>
                ) : null}
              </div>
            ))}
          </div>
        </Card>
      </section>
    </>
  );
}
