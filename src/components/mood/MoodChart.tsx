"use client";

type MoodDataPoint = {
  date: string;
  value: number; // 1-5
};

type MoodChartProps = {
  data: MoodDataPoint[];
  /** 30 | 60 | 90 day window */
  days?: number;
};

const moodLabels = ["", "Very Low", "Low", "Neutral", "Good", "Excellent"];

export function MoodChart({ data, days = 30 }: MoodChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)]">
        <p className="text-body-sm text-[var(--text-tertiary)]">
          No mood entries yet. Complete your first daily check-in.
        </p>
      </div>
    );
  }

  const maxValue = 5;
  const chartHeight = 180;
  const pointSpacing = data.length > 1 ? 100 / (data.length - 1) : 50;

  const points = data.map((point, index) => ({
    x: data.length === 1 ? 50 : index * pointSpacing,
    y: chartHeight - (point.value / maxValue) * chartHeight,
    ...point,
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-label text-[var(--text-secondary)]">{days}-day mood trend</p>
        <div className="flex gap-1 text-xs">
          {[30, 60, 90].map((d) => (
            <span
              className={`rounded-[var(--radius-sm)] px-2 py-1 ${
                d === days
                  ? "bg-[var(--savanna-100)] text-[var(--savanna-800)]"
                  : "text-[var(--text-tertiary)]"
              }`}
              key={d}
            >
              {d}d
            </span>
          ))}
        </div>
      </div>

      <div className="relative rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
        {/* Y-axis labels */}
        <div className="absolute left-2 top-4 flex h-[180px] flex-col justify-between text-[10px] text-[var(--text-tertiary)]">
          {[5, 4, 3, 2, 1].map((v) => (
            <span key={v}>{v}</span>
          ))}
        </div>

        {/* Chart area */}
        <div className="ml-6">
          <svg
            className="w-full"
            preserveAspectRatio="none"
            viewBox={`0 0 100 ${chartHeight}`}
          >
            {/* Grid lines */}
            {[1, 2, 3, 4, 5].map((v) => (
              <line
                key={v}
                stroke="var(--border-subtle)"
                strokeDasharray="2 2"
                strokeWidth="0.3"
                x1="0"
                x2="100"
                y1={chartHeight - (v / maxValue) * chartHeight}
                y2={chartHeight - (v / maxValue) * chartHeight}
              />
            ))}

            {/* Line */}
            <path
              d={linePath}
              fill="none"
              stroke="var(--savanna-400)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />

            {/* Dots */}
            {points.map((p, i) => (
              <circle
                cx={p.x}
                cy={p.y}
                fill="var(--savanna-500)"
                key={i}
                r="2"
                stroke="var(--bg-surface)"
                strokeWidth="1"
              />
            ))}
          </svg>

          {/* X-axis date labels */}
          <div className="mt-2 flex justify-between text-[10px] text-[var(--text-tertiary)]">
            {data.length > 0 && <span>{data[0].date}</span>}
            {data.length > 1 && <span>{data[data.length - 1].date}</span>}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-[var(--text-secondary)]">
        {moodLabels.slice(1).map((label, i) => (
          <span className="flex items-center gap-1" key={label}>
            <span className="inline-block h-2 w-2 rounded-full bg-[var(--savanna-400)]" />
            {i + 1} = {label}
          </span>
        ))}
      </div>
    </div>
  );
}
