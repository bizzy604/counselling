"use client";

import { useEffect, useState } from "react";

import { Card } from "@/components/ui/Card";
import { JournalEntry } from "@/components/mood/JournalEntry";
import { Button } from "@/components/ui/Button";
import { submitJournalEntry } from "@/server/actions";

const prompts = [
  "What's one thing you're grateful for today?",
  "Describe a moment that made you smile recently.",
  "What challenge are you working through right now?",
  "What would make tomorrow a great day?",
  "How did you take care of yourself today?",
];

type PastEntry = {
  id: string;
  prompt: string | null;
  body: string;
  createdAt: string;
};

export default function JournalPage() {
  const prompt = prompts[new Date().getDay() % prompts.length];
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pastEntries, setPastEntries] = useState<PastEntry[]>([]);

  useEffect(() => {
    fetch("/v1/journal")
      .then((r) => r.json())
      .then((json) => setPastEntries(json.data ?? []));
  }, []);

  async function handleSave() {
    if (!body.trim()) return;
    setSaving(true);
    const entry = await submitJournalEntry(prompt, body);
    setPastEntries((prev) => [{ ...entry, prompt: entry.prompt ?? null }, ...prev]);
    setBody("");
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      <header className="mb-2">
        <h1 className="text-h2 text-[var(--text-primary)]">Journal</h1>
        <p className="text-body mt-1 text-[var(--text-secondary)]">
          A private space to reflect and express your thoughts.
        </p>
      </header>

      <Card eyebrow="Today's prompt" title={prompt}>
        <JournalEntry onChange={setBody} />
        <div className="mt-4 flex items-center gap-3">
          <Button disabled={!body.trim() || saving} onClick={handleSave} variant="primary">
            {saving ? "Saving…" : "Save entry"}
          </Button>
          {saved && <span className="text-sm text-[var(--text-success)]">Saved!</span>}
        </div>
      </Card>

      <Card title="Past entries">
        {pastEntries.length === 0 ? (
          <p className="text-body text-[var(--text-tertiary)]">
            No journal entries yet. Write your first one above.
          </p>
        ) : (
          <div className="space-y-3">
            {pastEntries.map((entry) => (
              <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] p-4" key={entry.id}>
                {entry.prompt && (
                  <p className="text-caption text-[var(--text-tertiary)]">{entry.prompt}</p>
                )}
                <p className="text-body mt-1 text-[var(--text-primary)]">{entry.body}</p>
                <p className="text-body-sm mt-2 text-[var(--text-tertiary)]">
                  {new Date(entry.createdAt).toLocaleDateString("en-KE", { dateStyle: "medium" })}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
