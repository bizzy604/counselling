import { Bell, ClipboardPlus, Users } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Notice } from "@/components/ui/Notice";
import { getSessionUser } from "@/server/auth/session";
import { createReferralAction } from "@/server/referrals/actions";
import { getEmployerDashboardSnapshot } from "@/server/referrals/service";
import { formatServiceTypeLabel } from "@/server/scheduling/service";
import { serviceTypes, urgencyLevels } from "@/server/scheduling/types";

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

export default async function EmployerDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getSessionUser();

  if (!user) {
    return null;
  }

  const snapshot = await getEmployerDashboardSnapshot(user);
  const params = await searchParams;
  const notice = readSearchParam(params.notice);
  const tone = readSearchParam(params.tone) === "error" ? "error" : "success";

  return (
    <>
      {notice ? <Notice tone={tone}>{notice}</Notice> : null}

      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <p className="text-caption text-[var(--text-secondary)]">Referrals submitted</p>
          <p className="mt-3 font-display text-4xl text-[var(--text-primary)]">
            {snapshot.stats.submitted}
          </p>
        </Card>
        <Card>
          <p className="text-caption text-[var(--text-secondary)]">Assigned onward</p>
          <p className="mt-3 font-display text-4xl text-[var(--text-primary)]">
            {snapshot.stats.assigned}
          </p>
        </Card>
        <Card>
          <p className="text-caption text-[var(--text-secondary)]">Rejected</p>
          <p className="mt-3 font-display text-4xl text-[var(--text-primary)]">
            {snapshot.stats.rejected}
          </p>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <Card
          aside={<Users aria-hidden="true" className="text-[var(--text-secondary)]" size={18} />}
          id="referrals"
          title="Submit referral"
        >
          <p className="text-body text-[var(--text-secondary)]">
            Referrals are limited to employees within your department scope. Use the
            employee work email.
          </p>
          <form action={createReferralAction} className="mt-6 space-y-4">
            <div className="space-y-2">
              <label className="text-label block text-[var(--text-primary)]" htmlFor="employeeIdentifier">
                Employee work email
              </label>
              <input
                className="input"
                id="employeeIdentifier"
                name="employeeIdentifier"
                placeholder="person@health.go.ke"
                required
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-label block text-[var(--text-primary)]" htmlFor="serviceType">
                  Service type
                </label>
                <select className="input" defaultValue="ASSESSMENT" id="serviceType" name="serviceType">
                  {serviceTypes.map((serviceType) => (
                    <option key={serviceType} value={serviceType}>
                      {formatServiceTypeLabel(serviceType)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-label block text-[var(--text-primary)]" htmlFor="urgency">
                  Urgency
                </label>
                <select className="input" defaultValue="URGENT" id="urgency" name="urgency">
                  {urgencyLevels.map((urgency) => (
                    <option key={urgency} value={urgency}>
                      {urgency.charAt(0)}{urgency.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-label block text-[var(--text-primary)]" htmlFor="notes">
                Referral notes
              </label>
              <textarea
                className="input min-h-28 resize-y"
                id="notes"
                name="notes"
                placeholder="Operational context for the admin assignment team."
              />
            </div>
            <Button type="submit">
              <ClipboardPlus aria-hidden="true" size={16} />
              Submit referral
            </Button>
          </form>
        </Card>

        <Card
          aside={<Bell aria-hidden="true" className="text-[var(--text-secondary)]" size={18} />}
          id="reports"
          title="Recent notifications"
        >
          <div className="space-y-4">
            {snapshot.notifications.map((notification) => (
              <div
                className="rounded-[20px] border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] p-4"
                key={notification.id}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-label text-[var(--text-primary)]">{notification.type}</p>
                  <Badge variant={notification.status === "READ" ? "inactive" : "active"}>
                    {notification.status}
                  </Badge>
                </div>
                <p className="mt-2 text-body-sm text-[var(--text-secondary)]">
                  {dateTimeFormatter.format(new Date(notification.createdAt))}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6">
        <Card title="Referral status">
          <div className="space-y-4">
            {snapshot.referrals.map((referral) => (
              <div
                className="rounded-[22px] border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] p-4"
                key={referral.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-label text-[var(--text-primary)]">{referral.clientName}</p>
                    <p className="text-body-sm mt-1 text-[var(--text-secondary)]">
                      {formatServiceTypeLabel(referral.serviceType)} -{" "}
                      {dateTimeFormatter.format(new Date(referral.createdAt))}
                    </p>
                  </div>
                  <Badge
                    variant={
                      referral.status === "ASSIGNED"
                        ? "complete"
                        : referral.status === "REJECTED"
                          ? "inactive"
                          : "pending"
                    }
                  >
                    {referral.status}
                  </Badge>
                </div>
                {referral.notes ? (
                  <p className="mt-3 text-body-sm text-[var(--text-secondary)]">{referral.notes}</p>
                ) : null}
                {referral.reason ? (
                  <p className="mt-2 text-body-sm text-[var(--text-danger)]">
                    Rejection reason: {referral.reason}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </Card>
      </section>
    </>
  );
}
