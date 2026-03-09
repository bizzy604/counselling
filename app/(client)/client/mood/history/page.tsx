"use client";

import { useEffect, useState } from "react";

import { Card } from "@/components/ui/Card";
import { MoodChart } from "@/components/mood/MoodChart";

async function fetchMoodHistory(days: number) {
  const res = await fetch(`/v1/mood?days=${days}`);
  if (!res.ok) return [];
  const json = await res.json();
  return json.data as Array<{ date: string; value: number }>;
}

export default function MoodHistoryPage() {
  const [window, setWindow] = useState<30 | 60 | 90>(30);
  const [entries, setEntries] = useState<Array<{ date: string; value: number }>>([]);

  useEffect(() => {
    fetchMoodHistory(window).then(setEntries);
  }, [window]);

  return (
    <>
      <header className="mb-2">
        <h1 className="text-h2 text-[var(--text-primary)]">Mood Trends</h1>
        <p className="text-body mt-1 text-[var(--text-secondary)]">
          Track how your mood has changed over time.
        </p>
      </header>

      <Card>
        <div className="mb-4 flex gap-2">
          {([30, 60, 90] as const).map((d) => (
            <button
              className={`btn btn-sm ${window === d ? "btn-primary" : "btn-ghost"}`}
              key={d}
              onClick={() => setWindow(d)}
              type="button"
            >
              {d} days
            </button>
          ))}
        </div>
        <MoodChart data={entries} days={window} />
      </Card>
    </>
  );
}
