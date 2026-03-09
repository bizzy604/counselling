import { Users } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { getSessionUser } from "@/server/auth/session";
import { getCounsellorDashboardSnapshot } from "@/server/scheduling/service";

export default async function ClientListPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const snapshot = await getCounsellorDashboardSnapshot(user);

  // Derive unique clients from appointments
  const clientMap = new Map<string, { id: string; name: string; lastSeen: string; count: number }>();
  for (const a of snapshot.appointments) {
    const existing = clientMap.get(a.clientId);
    if (existing) {
      existing.count++;
      if (a.scheduledAt > existing.lastSeen) existing.lastSeen = a.scheduledAt;
    } else {
      clientMap.set(a.clientId, {
        id: a.clientId,
        name: a.clientName,
        lastSeen: a.scheduledAt,
        count: 1,
      });
    }
  }

  const clients = Array.from(clientMap.values()).sort((a, b) => b.lastSeen.localeCompare(a.lastSeen));

  return (
    <>
      <header className="mb-2">
        <h1 className="text-h2 text-[var(--text-primary)]">Clients</h1>
        <p className="text-body mt-1 text-[var(--text-secondary)]">
          All clients assigned to your caseload.
        </p>
      </header>

      <Card
        aside={<Users aria-hidden className="text-[var(--text-secondary)]" size={18} />}
        title={`${clients.length} client${clients.length !== 1 ? "s" : ""}`}
      >
        {clients.length === 0 ? (
          <p className="text-body text-[var(--text-tertiary)]">No clients assigned yet.</p>
        ) : (
          <div className="space-y-3">
            {clients.map((c) => (
              <a
                className="flex items-center justify-between rounded-[var(--radius-lg)] border border-[var(--border-subtle)] p-4 transition-colors hover:bg-[var(--bg-surface-raised)]"
                href={`/counsellor/clients/${c.id}`}
                key={c.id}
              >
                <div>
                  <p className="text-label text-[var(--text-primary)]">{c.name}</p>
                  <p className="text-body-sm mt-1 text-[var(--text-tertiary)]">
                    {c.count} session{c.count !== 1 ? "s" : ""}
                  </p>
                </div>
                <Badge variant="active">Active</Badge>
              </a>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
