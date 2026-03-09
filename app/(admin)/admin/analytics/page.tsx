import { BarChart3 } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { KPICard } from "@/components/admin/KPICard";
import { UtilisationTable } from "@/components/admin/UtilisationTable";
import { requireRole } from "@/server/auth/session";
import { getAnalyticsSnapshot } from "@/server/admin/service";

export default async function AnalyticsDashboardPage() {
  await requireRole("ADMIN");
  const analytics = await getAnalyticsSnapshot();

  return (
    <>
      <header className="mb-2">
        <h1 className="text-h2 text-[var(--text-primary)]">Analytics</h1>
        <p className="text-body mt-1 text-[var(--text-secondary)]">
          Platform-wide metrics, utilisation rates, and trends.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Active users (30d)" value={analytics.activeUsers} change="" trend="neutral" />
        <KPICard label="Sessions (30d)" value={analytics.sessionsThisMonth} change="" trend="neutral" />
        <KPICard label="Avg. mood score" value={analytics.avgMood || "—"} change="" trend="neutral" />
        <KPICard label="Crisis events (30d)" value={analytics.crisisCount} change="" trend="neutral" accentColor="jasper" />
      </section>

      <Card title="Counsellor utilisation">
        <UtilisationTable counsellors={analytics.counsellors} />
      </Card>
    </>
  );
}
