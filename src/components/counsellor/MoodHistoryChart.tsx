"use client";

import { MoodChart } from "@/components/mood/MoodChart";

type MoodHistoryChartProps = {
  clientName: string;
  consentGranted: boolean;
  data: { date: string; value: number }[];
  days?: number;
};

export function MoodHistoryChart({
  clientName,
  consentGranted,
  data,
  days = 30,
}: MoodHistoryChartProps) {
  if (!consentGranted) {
    return (
      <div className="flex h-48 items-center justify-center rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)]">
        <p className="text-body-sm text-[var(--text-tertiary)]">
          Mood data is only visible when {clientName} has granted consent.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-label text-[var(--text-secondary)]">
        Mood history for {clientName}
      </p>
      <MoodChart data={data} days={days} />
    </div>
  );
}
