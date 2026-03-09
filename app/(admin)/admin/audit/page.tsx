import { Shield } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { requireRole } from "@/server/auth/session";
import { listRecentAuditEvents } from "@/server/auth/audit";

const dateTimeFormatter = new Intl.DateTimeFormat("en-KE", {
  dateStyle: "medium",
  timeStyle: "medium",
});

export default async function AuditLogPage() {
  await requireRole("ADMIN");
  const auditEntries = await listRecentAuditEvents(50);

  return (
    <>
      <header className="mb-2">
        <h1 className="text-h2 text-[var(--text-primary)]">Audit Log</h1>
        <p className="text-body mt-1 text-[var(--text-secondary)]">
          Authentication events and sensitive data access records.
        </p>
      </header>

      <Card
        aside={<Shield aria-hidden className="text-[var(--text-secondary)]" size={18} />}
        title="Recent events"
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="border-b border-[var(--border-default)]">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Time</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Actor</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Action</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">IP Address</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Outcome</th>
              </tr>
            </thead>
            <tbody>
              {auditEntries.map((entry) => (
                <tr className="border-b border-[var(--border-subtle)] last:border-b-0" key={entry.id}>
                  <td className="whitespace-nowrap px-3 py-3 font-mono text-xs text-[var(--text-tertiary)]">
                    {dateTimeFormatter.format(new Date(entry.occurredAt))}
                  </td>
                  <td className="px-3 py-3 text-[var(--text-primary)]">{entry.actorId}</td>
                  <td className="px-3 py-3 font-mono text-xs text-[var(--text-primary)]">{entry.eventType}</td>
                  <td className="px-3 py-3 text-[var(--text-secondary)]">{entry.ipAddress}</td>
                  <td className="px-3 py-3">
                    <Badge variant={entry.outcome === "SUCCESS" ? "active" : "crisis"}>
                      {entry.outcome.toLowerCase()}
                    </Badge>
                  </td>
                </tr>
              ))}
              {auditEntries.length === 0 && (
                <tr>
                  <td className="px-3 py-6 text-center text-[var(--text-tertiary)]" colSpan={5}>
                    No audit events recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
