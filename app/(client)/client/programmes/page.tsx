import { BookOpen, CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { requireRole } from "@/server/auth/session";
import { listClientEnrollments } from "@/server/content/service";

export default async function ProgrammesPage() {
  const user = await requireRole("CLIENT");
  const programmes = await listClientEnrollments(user);

  return (
    <>
      <header className="mb-2">
        <h1 className="text-h2 text-[var(--text-primary)]">My Programmes</h1>
        <p className="text-body mt-1 text-[var(--text-secondary)]">
          Assigned wellness programmes and your progress.
        </p>
      </header>

      {programmes.length === 0 ? (
        <Card>
          <p className="py-6 text-center text-[var(--text-tertiary)]">
            You are not enrolled in any programmes yet.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {programmes.map((prog) => {
            const pct = prog.modules > 0 ? Math.round((prog.completed / prog.modules) * 100) : 0;
            const done = pct === 100;

            return (
              <Card key={prog.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {done ? (
                      <CheckCircle2 className="mt-0.5 text-[var(--text-success)]" size={20} />
                    ) : (
                      <BookOpen className="mt-0.5 text-[var(--text-secondary)]" size={20} />
                    )}
                    <div>
                      <p className="text-label text-[var(--text-primary)]">{prog.title}</p>
                      <p className="text-body-sm mt-1 text-[var(--text-secondary)]">
                        {prog.completed} of {prog.modules} modules completed
                      </p>
                    </div>
                  </div>
                  <Badge variant={done ? "inactive" : prog.status}>
                    {done ? "Completed" : "In Progress"}
                  </Badge>
                </div>

                <div className="mt-4">
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-subtle)]">
                    <div
                      className="h-full rounded-full bg-[var(--savanna-500)] transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-2 text-right font-mono text-xs text-[var(--text-tertiary)]">{pct}%</p>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
