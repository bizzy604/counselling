import { cn } from "@/lib/utils";

type CounsellorRow = {
  id: string;
  name: string;
  currentLoad: number;
  maxCaseload: number;
  sessionsCompleted: number;
  completionRate: number;
};

type UtilisationTableProps = {
  counsellors: CounsellorRow[];
};

export function UtilisationTable({ counsellors }: UtilisationTableProps) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-xl)] border border-[var(--border-subtle)] shadow-[var(--shadow-xs)]">
      <table className="w-full border-collapse font-[family-name:var(--font-body)] text-sm">
        <thead className="border-b border-[var(--border-default)] bg-[var(--bg-surface-raised)]">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.05em] text-[var(--text-secondary)]">
              Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.05em] text-[var(--text-secondary)]">
              Load
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.05em] text-[var(--text-secondary)]">
              Sessions
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.05em] text-[var(--text-secondary)]">
              Completion
            </th>
          </tr>
        </thead>
        <tbody>
          {counsellors.map((c) => {
            const utilisation = c.maxCaseload > 0 ? c.currentLoad / c.maxCaseload : 0;
            const nearCap = utilisation >= 0.85;

            return (
              <tr
                className="border-b border-[var(--border-subtle)] last:border-b-0 hover:bg-[var(--bg-surface-raised)]"
                key={c.id}
              >
                <td className="px-4 py-4 text-[var(--text-primary)]">{c.name}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-[var(--bg-subtle)]">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          nearCap ? "bg-[var(--sienna-400)]" : "bg-[var(--savanna-500)]",
                        )}
                        style={{ width: `${Math.min(utilisation * 100, 100)}%` }}
                      />
                    </div>
                    <span className="font-mono text-xs tabular-nums text-[var(--text-secondary)]">
                      {c.currentLoad}/{c.maxCaseload}
                    </span>
                    {nearCap && (
                      <span className="text-xs text-[var(--text-warning)]">⚠ near cap</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 font-mono text-[var(--text-primary)]">
                  {c.sessionsCompleted}
                </td>
                <td className="px-4 py-4 font-mono text-[var(--text-primary)]">
                  {c.completionRate}%
                </td>
              </tr>
            );
          })}
          {counsellors.length === 0 && (
            <tr>
              <td
                className="px-4 py-8 text-center text-[var(--text-tertiary)]"
                colSpan={4}
              >
                No counsellor data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
