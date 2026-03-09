import { BarChart3 } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { requireRole } from "@/server/auth/session";
import { getEmployerReportStats } from "@/server/admin/service";

export default async function DepartmentReportsPage() {
  const user = await requireRole("EMPLOYER");
  const stats = await getEmployerReportStats(user.id);

  return (
    <>
      <header className="mb-2">
        <h1 className="text-h2 text-[var(--text-primary)]">Department Reports</h1>
        <p className="text-body mt-1 text-[var(--text-secondary)]">
          Anonymised aggregate wellness utilisation metrics for your department.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <p className="text-caption text-[var(--text-secondary)]">Utilisation rate</p>
          <p className="mt-3 font-display text-4xl text-[var(--text-primary)]">{stats.utilisationRate}%</p>
        </Card>
        <Card>
          <p className="text-caption text-[var(--text-secondary)]">Sessions this quarter</p>
          <p className="mt-3 font-display text-4xl text-[var(--text-primary)]">{stats.sessionCount}</p>
        </Card>
        <Card>
          <p className="text-caption text-[var(--text-secondary)]">Avg. mood score</p>
          <p className="mt-3 font-display text-4xl text-[var(--text-primary)]">{stats.avgMood || "—"}</p>
          {stats.avgMood > 0 && (
            <p className="mt-1 text-xs text-[var(--text-tertiary)]">out of 5.0</p>
          )}
        </Card>
      </section>

      <Card title="Service breakdown">
        <p className="text-body text-[var(--text-tertiary)]">
          Detailed anonymised breakdowns by service type will be available as more data is collected.
        </p>
      </Card>
    </>
  );
}
