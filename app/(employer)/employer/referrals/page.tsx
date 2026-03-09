import { Calendar, Clock3, Users } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { getSessionUser } from "@/server/auth/session";
import { getEmployerDashboardSnapshot } from "@/server/referrals/service";
import { formatServiceTypeLabel } from "@/server/scheduling/service";

const dateTimeFormatter = new Intl.DateTimeFormat("en-KE", {
  dateStyle: "medium",
  timeStyle: "short",
});

const statusVariant: Record<string, "active" | "inactive" | "pending" | "crisis"> = {
  PENDING: "pending",
  ASSIGNED: "active",
  REJECTED: "crisis",
  ACCEPTED: "active",
};

export default async function ReferralHistoryPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const snapshot = await getEmployerDashboardSnapshot(user);

  return (
    <>
      <header className="mb-2">
        <h1 className="text-h2 text-[var(--text-primary)]">Referral History</h1>
        <p className="text-body mt-1 text-[var(--text-secondary)]">
          Track all referrals you have submitted and their current status.
        </p>
      </header>

      <Card
        aside={<Users aria-hidden className="text-[var(--text-secondary)]" size={18} />}
        title={`${snapshot.referrals.length} referral${snapshot.referrals.length !== 1 ? "s" : ""}`}
      >
        {snapshot.referrals.length === 0 ? (
          <p className="text-body text-[var(--text-tertiary)]">No referrals submitted yet.</p>
        ) : (
          <div className="space-y-3">
            {snapshot.referrals.map((r) => (
              <div
                className="flex items-center justify-between rounded-[var(--radius-lg)] border border-[var(--border-subtle)] p-4"
                key={r.id}
              >
                <div>
                  <p className="text-label text-[var(--text-primary)]">
                    {r.clientName}
                  </p>
                  <p className="text-body-sm mt-1 text-[var(--text-secondary)]">
                    {formatServiceTypeLabel(r.serviceType)} &middot;{" "}
                    {dateTimeFormatter.format(new Date(r.createdAt))}
                  </p>
                  {r.reason && (
                    <p className="text-body-sm mt-1 text-[var(--text-tertiary)]">{r.reason}</p>
                  )}
                </div>
                <Badge variant={statusVariant[r.status] ?? "inactive"}>{r.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
