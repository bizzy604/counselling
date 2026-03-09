import { cn } from "@/lib/utils";

type Trend = "up" | "down" | "neutral";

type KPICardProps = {
  label: string;
  value: string | number;
  change?: string;
  trend?: Trend;
  accentColor?: "savanna" | "jasper" | "sienna";
};

const trendColors: Record<Trend, string> = {
  up: "text-[var(--text-success)]",
  down: "text-[var(--text-danger)]",
  neutral: "text-[var(--text-secondary)]",
};

const accentBorders: Record<NonNullable<KPICardProps["accentColor"]>, string> = {
  savanna: "border-b-[var(--savanna-500)]",
  jasper: "border-b-[var(--jasper-500)]",
  sienna: "border-b-[var(--sienna-400)]",
};

export function KPICard({
  accentColor = "savanna",
  change,
  label,
  trend = "neutral",
  value,
}: KPICardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-xl)] border border-[var(--border-subtle)] border-b-2 bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-xs)]",
        accentBorders[accentColor],
      )}
    >
      <p className="text-caption text-[var(--text-secondary)]">{label}</p>
      <p className="mt-2 font-mono text-3xl font-medium tabular-nums text-[var(--text-primary)]">
        {value}
      </p>
      {change && (
        <p className={cn("mt-2 text-xs font-medium", trendColors[trend])}>
          {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {change}
        </p>
      )}
    </div>
  );
}
