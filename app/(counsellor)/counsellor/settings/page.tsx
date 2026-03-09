"use client";

import { useEffect, useState } from "react";
import { Settings } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { loadCounsellorSettings, updateCounsellorSettings } from "@/server/actions";

export default function CounsellorSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    bio: "",
    specialisations: "",
    languages: "",
    maxCaseload: 20,
  });

  useEffect(() => {
    loadCounsellorSettings().then(setSettings);
  }, []);

  async function handleSave() {
    await updateCounsellorSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      <header className="mb-2">
        <h1 className="text-h2 text-[var(--text-primary)]">Settings</h1>
        <p className="text-body mt-1 text-[var(--text-secondary)]">
          Manage your profile and workspace preferences.
        </p>
      </header>

      <Card
        aside={<Settings aria-hidden className="text-[var(--text-secondary)]" size={18} />}
        title="Profile"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-label block text-[var(--text-primary)]" htmlFor="bio">Bio</label>
            <textarea
              className="input min-h-[100px]"
              id="bio"
              onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
              placeholder="Brief professional summary…"
              value={settings.bio}
            />
          </div>
          <div className="space-y-2">
            <label className="text-label block text-[var(--text-primary)]" htmlFor="specialisations">
              Specialisations
            </label>
            <input
              className="input"
              id="specialisations"
              onChange={(e) => setSettings({ ...settings, specialisations: e.target.value })}
              placeholder="e.g. Stress, Family, Substance Use"
              value={settings.specialisations}
            />
          </div>
          <div className="space-y-2">
            <label className="text-label block text-[var(--text-primary)]" htmlFor="languages">
              Languages
            </label>
            <input className="input" id="languages" onChange={(e) => setSettings({ ...settings, languages: e.target.value })} placeholder="e.g. English, Swahili" value={settings.languages} />
          </div>
          <div className="space-y-2">
            <label className="text-label block text-[var(--text-primary)]" htmlFor="maxCaseload">
              Max caseload
            </label>
            <input className="input" id="maxCaseload" min={1} onChange={(e) => setSettings({ ...settings, maxCaseload: Number(e.target.value) })} type="number" value={settings.maxCaseload} />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Button onClick={handleSave} variant="primary">Save changes</Button>
          {saved && <span className="text-sm text-[var(--text-success)]">Saved!</span>}
        </div>
      </Card>
    </>
  );
}
