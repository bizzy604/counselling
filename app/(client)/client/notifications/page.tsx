import { Bell } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { getSessionUser } from "@/server/auth/session";
import { listNotificationsForUser } from "@/server/notifications/service";

const dateTimeFormatter = new Intl.DateTimeFormat("en-KE", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function NotificationsPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const notifications = await listNotificationsForUser(user);

  return (
    <>
      <header className="mb-2">
        <h1 className="text-h2 text-[var(--text-primary)]">Notifications</h1>
        <p className="text-body mt-1 text-[var(--text-secondary)]">
          Stay updated on appointments, referrals, and system messages.
        </p>
      </header>

      <Card
        aside={<Bell aria-hidden className="text-[var(--text-secondary)]" size={18} />}
        title={`${notifications.length} notification${notifications.length !== 1 ? "s" : ""}`}
      >
        {notifications.length === 0 ? (
          <p className="text-body text-[var(--text-tertiary)]">All caught up — no new notifications.</p>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] p-4 transition-colors hover:bg-[var(--bg-surface-raised)]"
                key={n.id}
              >
                <p className="text-label text-[var(--text-primary)]">{n.type}</p>
                <p className="text-body-sm mt-1 text-[var(--text-secondary)]">
                  {typeof n.payload === "object" && n.payload !== null && "message" in n.payload
                    ? String((n.payload as Record<string, unknown>).message)
                    : JSON.stringify(n.payload)}
                </p>
                <p className="text-caption mt-2 text-[var(--text-tertiary)]">
                  {dateTimeFormatter.format(new Date(n.createdAt))}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
