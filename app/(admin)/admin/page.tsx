import { BarChart3, Calendar, Shield, Users } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Notice } from "@/components/ui/Notice";
import { getSessionUser } from "@/server/auth/session";
import {
  assignCounsellingRequestAction,
  rejectCounsellingRequestAction,
} from "@/server/scheduling/actions";
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

  return (
    <>
      {notice ? <Notice tone={tone}>{notice}</Notice> : null}

      <section className="grid gap-4 lg:grid-cols-4">
        <Card>
          <p className="text-caption text-[var(--text-secondary)]">Pending requests</p>
          <p className="mt-3 font-display text-4xl text-[var(--text-primary)]">
            {snapshot.queue.length}
          </p>
        </Card>
        <Card>
          <p className="text-caption text-[var(--text-secondary)]">Urgent queue items</p>
          <p className="mt-3 font-display text-4xl text-[var(--text-primary)]">
            {snapshot.queue.filter((request) => request.urgency !== "ROUTINE").length}
          </p>
        </Card>
        <Card>
          <p className="text-caption text-[var(--text-secondary)]">Available counsellors</p>
          <p className="mt-3 font-display text-4xl text-[var(--text-primary)]">
            {snapshot.counsellors.length}
          </p>
        </Card>
        <Card>
          <p className="text-caption text-[var(--text-secondary)]">Scheduled appointments</p>
          <p className="mt-3 font-display text-4xl text-[var(--text-primary)]">
            {snapshot.scheduledAppointments.length}
          </p>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Card
          aside={<Users aria-hidden="true" className="text-[var(--text-secondary)]" size={18} />}
          id="queue"
          title="Pending assignment queue"
        >
          <div className="space-y-4">
            {snapshot.queue.map((request) => {
              const matchingSlots = snapshot.counsellors
                .filter((counsellor) => {
                  return (
                    !request.preferredCounsellorId ||
                    counsellor.id === request.preferredCounsellorId
                  );
                })
                .flatMap((counsellor) =>
                  counsellor.nextSlots.map((slot) => ({
                    label: `${counsellor.title} - ${dateTimeFormatter.format(new Date(slot.startsAt))}`,
                    value: `${counsellor.id}||${slot.startsAt}`,
                  })),
                );

              return (
                <div
                  className="rounded-[24px] border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] p-5"
                  key={request.id}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-h4 text-[var(--text-primary)]">{request.clientName}</p>
                      <p className="text-body-sm mt-1 text-[var(--text-secondary)]">
                        {formatRequestSourceLabel(request.source)} -{" "}
                        {formatServiceTypeLabel(request.serviceType)}
                      </p>
                    </div>
                    <Badge variant={request.urgency === "ROUTINE" ? "pending" : "crisis"}>
                      {request.urgency}
                    </Badge>
                  </div>
                  {request.preferredCounsellorName ? (
                    <p className="text-body-sm mt-4 text-[var(--text-secondary)]">
                      Preferred counsellor: {request.preferredCounsellorName}
                    </p>
                  ) : null}
                  {request.notes ? (
                    <p className="text-body-sm mt-2 text-[var(--text-secondary)]">{request.notes}</p>
                  ) : null}
                  <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
                    {matchingSlots.length ? (
                      <form action={assignCounsellingRequestAction} className="space-y-3">
                        <input name="requestId" type="hidden" value={request.id} />
                        <label className="space-y-2 block">
                          <span className="text-body-sm text-[var(--text-secondary)]">
                            Assign to slot
                          </span>
                          <select className="input" name="assignment">
                            {matchingSlots.map((slot) => (
                              <option key={slot.value} value={slot.value}>
                                {slot.label}
                              </option>
                            ))}
                          </select>
                        </label>
                        <Button size="sm" type="submit">
                          Assign request
                        </Button>
                      </form>
                    ) : (
                      <div className="rounded-[20px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 text-body-sm text-[var(--text-secondary)]">
                        No compatible open slots are currently available for this request.
                      </div>
                    )}
                    <form action={rejectCounsellingRequestAction} className="space-y-3">
                      <input name="requestId" type="hidden" value={request.id} />
                      <label className="space-y-2 block">
                        <span className="text-body-sm text-[var(--text-secondary)]">
                          Rejection reason
                        </span>
                        <textarea
                          className="input min-h-24 resize-y"
                          name="reason"
                          placeholder="Explain why the request cannot proceed."
                          required
                        />
                      </label>
                      <Button size="sm" type="submit" variant="danger">
                        Reject request
                      </Button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="grid gap-6">
          <Card
            aside={
              <BarChart3 aria-hidden="true" className="text-[var(--text-secondary)]" size={18} />
            }
            title="Counsellor capacity"
          >
            <div className="space-y-4">
              {snapshot.counsellors.map((counsellor) => (
                <div
                  className="rounded-[20px] border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] p-4"
                  key={counsellor.id}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-label text-[var(--text-primary)]">{counsellor.title}</p>
                    <Badge variant={counsellor.openSlots > 0 ? "active" : "inactive"}>
                      {counsellor.openSlots} open
                    </Badge>
                  </div>
                  <p className="mt-2 text-body-sm text-[var(--text-secondary)]">
                    Caseload {counsellor.activeCaseload} / {counsellor.maxCaseload}
                  </p>
                  <p className="mt-1 text-body-sm text-[var(--text-secondary)]">
                    {counsellor.specialisations.join(" / ")}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card
            aside={<Calendar aria-hidden="true" className="text-[var(--text-secondary)]" size={18} />}
            title="Scheduled appointments"
          >
            <div className="space-y-3">
              {snapshot.scheduledAppointments.slice(0, 6).map((appointment) => (
                <div
                  className="rounded-[18px] border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] px-4 py-3"
                  key={appointment.id}
                >
                  <p className="text-label text-[var(--text-primary)]">
                    {appointment.clientName} - {appointment.counsellorName}
                  </p>
                  <p className="text-body-sm text-[var(--text-secondary)]">
                    {formatServiceTypeLabel(appointment.serviceType)} -{" "}
                    {dateTimeFormatter.format(new Date(appointment.scheduledAt))}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card
            aside={<Shield aria-hidden="true" className="text-[var(--text-secondary)]" size={18} />}
            id="safety"
            title="Queue governance"
          >
            <p className="text-body text-[var(--text-secondary)]">
              Requests from waitlist, employer, and crisis pathways remain unified here.
              Assignment creates the downstream appointment immediately and keeps the
              request record for audit.
            </p>
          </Card>
        </div>
      </section>
    </>
  );
}
