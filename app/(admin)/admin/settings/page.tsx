"use client";

import { useEffect, useState } from "react";
import { Settings } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { loadPlatformSettings, updatePlatformSettings } from "@/server/actions";

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    sessionDuration: 60,
    maxCaseload: 20,
    bookingWindow: 14,
    cancelDeadline: 24,
  });

  useEffect(() => {
    loadPlatformSettings().then(setSettings);
  }, []);

  async function handleSave() {
    await updatePlatformSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      <header className="mb-2">
        <h1 className="text-h2 text-[var(--text-primary)]">Platform Settings</h1>
        <p className="text-body mt-1 text-[var(--text-secondary)]">
          Configure system-wide defaults and operational parameters.
        </p>
      </header>

      <Card
        aside={<Settings aria-hidden className="text-[var(--text-secondary)]" size={18} />}
        title="Session defaults"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-label block text-[var(--text-primary)]" htmlFor="sessionDuration">
              Default session duration (minutes)
            </label>
            <input className="input" id="sessionDuration" min={15} onChange={(e) => setSettings({ ...settings, sessionDuration: Number(e.target.value) })} step={15} type="number" value={settings.sessionDuration} />
          </div>
          <div className="space-y-2">
            <label className="text-label block text-[var(--text-primary)]" htmlFor="maxCaseload">
              Default max caseload
            </label>
            <input className="input" id="maxCaseload" min={1} onChange={(e) => setSettings({ ...settings, maxCaseload: Number(e.target.value) })} type="number" value={settings.maxCaseload} />
          </div>
          <div className="space-y-2">
            <label className="text-label block text-[var(--text-primary)]" htmlFor="bookingWindow">
              Booking window (days ahead)
            </label>
            <input className="input" id="bookingWindow" min={1} onChange={(e) => setSettings({ ...settings, bookingWindow: Number(e.target.value) })} type="number" value={settings.bookingWindow} />
          </div>
          <div className="space-y-2">
            <label className="text-label block text-[var(--text-primary)]" htmlFor="cancelDeadline">
              Cancellation deadline (hours before)
            </label>
            <input className="input" id="cancelDeadline" min={1} onChange={(e) => setSettings({ ...settings, cancelDeadline: Number(e.target.value) })} type="number" value={settings.cancelDeadline} />
          </div>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <Button onClick={handleSave} variant="primary">Save settings</Button>
          {saved && <span className="text-sm text-[var(--text-success)]">Saved!</span>}
        </div>
      </Card>
    </>
  );
}
