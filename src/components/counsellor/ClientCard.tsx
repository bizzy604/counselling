import { Badge } from "@/components/ui/Badge";

type ClientCardProps = {
  name: string;
  status: "active" | "inactive";
  clientSince: string;
  sessionsCompleted: number;
  nextSession?: string;
  onClick?: () => void;
};

export function ClientCard({
  clientSince,
  name,
  nextSession,
  onClick,
  sessionsCompleted,
  status,
}: ClientCardProps) {
  return (
    <button
      className="card card--interactive w-full text-left transition hover:shadow-[var(--shadow-md)]"
      onClick={onClick}
      type="button"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-h4 text-[var(--text-primary)]">{name}</p>
          <p className="text-body-sm mt-1 text-[var(--text-secondary)]">
            Client since {clientSince}
          </p>
        </div>
        <Badge variant={status === "active" ? "active" : "inactive"}>
          {status}
        </Badge>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] p-3">
          <p className="text-caption text-[var(--text-secondary)]">Sessions</p>
          <p className="mt-1 font-display text-xl text-[var(--text-primary)]">
            {sessionsCompleted}
          </p>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] p-3">
          <p className="text-caption text-[var(--text-secondary)]">Next</p>
          <p className="mt-1 text-body-sm text-[var(--text-primary)]">
            {nextSession ?? "No session"}
          </p>
        </div>
      </div>
    </button>
  );
}
