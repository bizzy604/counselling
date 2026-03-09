import { ArrowLeft, Calendar, Clock3 } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { getSessionUser } from "@/server/auth/session";
import { formatServiceTypeLabel, listAppointmentsForUser } from "@/server/scheduling/service";

const dateTimeFormatter = new Intl.DateTimeFormat("en-KE", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user) return null;

  const { id: clientId } = await params;
  const allAppointments = await listAppointmentsForUser(user);
  const clientAppointments = allAppointments.filter((a) => a.clientId === clientId);
  const clientName = clientAppointments[0]?.clientName ?? "Client";

  return (
    <>
      <header className="mb-2">
        <a
          className="text-body-sm mb-2 inline-flex items-center gap-1 text-[var(--text-brand)] hover:underline"
          href="/counsellor/clients"
        >
          <ArrowLeft size={14} /> Back to clients
        </a>
        <h1 className="text-h2 text-[var(--text-primary)]">{clientName}</h1>
      </header>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card
          aside={<Calendar aria-hidden className="text-[var(--text-secondary)]" size={18} />}
          title="Session history"
        >
          {clientAppointments.length === 0 ? (
            <p className="text-body text-[var(--text-tertiary)]">No sessions recorded.</p>
          ) : (
            <div className="space-y-3">
              {clientAppointments.map((a) => (
                <div
                  className="flex items-center justify-between rounded-[var(--radius-lg)] border border-[var(--border-subtle)] p-4"
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
                  </div>
                  <Badge variant={a.status === "SCHEDULED" ? "active" : "inactive"}>
                    {a.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Mood history">
          <p className="text-body text-[var(--text-tertiary)]">
            Mood data will appear here once the client has opted in to mood sharing.
          </p>
        </Card>
      </div>
    </>
  );
}
