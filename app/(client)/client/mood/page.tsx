"use client";

import { Card } from "@/components/ui/Card";
import { MoodScale } from "@/components/mood/MoodScale";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { submitMoodCheckIn } from "@/server/actions";

export default function MoodCheckInPage() {
  const [selected, setSelected] = useState<number | undefined>(undefined);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (selected === undefined) return;
    setSubmitting(true);
    await submitMoodCheckIn(selected);
    setSubmitted(true);
    setSubmitting(false);
  }

  if (submitted) {
    return (
      <>
        <header className="mb-2">
          <h1 className="text-h2 text-[var(--text-primary)]">Mood Check-in</h1>
        </header>
        <Card>
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <span className="text-4xl">✓</span>
            <h2 className="text-h3 text-[var(--text-primary)]">Thank you!</h2>
            <p className="text-body text-[var(--text-secondary)]">
              Your mood has been recorded. Check back tomorrow for your next check-in.
            </p>
            <Button onClick={() => { setSubmitted(false); setSelected(undefined); }} variant="ghost">
              Log another
            </Button>
          </div>
        </Card>
      </>
    );
  }

  return (
    <>
      <header className="mb-2">
        <h1 className="text-h2 text-[var(--text-primary)]">Mood Check-in</h1>
        <p className="text-body mt-1 text-[var(--text-secondary)]">
          How are you feeling today? Select the emoji that best describes your current mood.
        </p>
      </header>

      <Card>
        <MoodScale onChange={setSelected} value={selected} />
        <div className="mt-8 flex justify-end">
          <Button disabled={selected === undefined || submitting} onClick={handleSubmit} variant="primary">
            {submitting ? "Saving…" : "Save check-in"}
          </Button>
        </div>
      </Card>
    </>
  );
}
