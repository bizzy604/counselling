"use client";

import { useEffect, useState } from "react";
import { Settings, User } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  loadClientSettings,
  updateClientSettings,
  loadClientProfile,
  updateClientProfile,
} from "@/server/actions";

export default function SettingsPage() {
  const [moodSharing, setMoodSharing] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    preferredLanguage: "en",
  });
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    loadClientSettings().then((s) => {
      setMoodSharing(s.moodSharing);
      setEmailNotifications(s.emailNotifications);
    });
    loadClientProfile().then(setProfile);
  }, []);

  async function handleSave() {
    await updateClientSettings({ moodSharing, emailNotifications });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      <header className="mb-2">
        <h1 className="text-h2 text-[var(--text-primary)]">Settings</h1>
        <p className="text-body mt-1 text-[var(--text-secondary)]">
          Manage your profile and preferences.
        </p>
      </header>

      <Card
        aside={<Settings aria-hidden className="text-[var(--text-secondary)]" size={18} />}
        title="Consent & Privacy"
      >
        <div className="space-y-5">
          <label className="flex items-center justify-between gap-4">
            <div>
              <p className="text-label text-[var(--text-primary)]">Share mood data with counsellor</p>
              <p className="text-body-sm text-[var(--text-secondary)]">
                Allow your assigned counsellor to view your mood check-in history.
              </p>
            </div>
            <button
              aria-pressed={moodSharing}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${moodSharing ? "bg-[var(--savanna-500)]" : "bg-[var(--bg-subtle)]"}`}
              onClick={() => setMoodSharing(!moodSharing)}
              role="switch"
              type="button"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${moodSharing ? "translate-x-5" : "translate-x-0"}`}
              />
            </button>
          </label>

          <label className="flex items-center justify-between gap-4">
            <div>
              <p className="text-label text-[var(--text-primary)]">Email notifications</p>
              <p className="text-body-sm text-[var(--text-secondary)]">
                Receive appointment reminders and system updates by email.
              </p>
            </div>
            <button
              aria-pressed={emailNotifications}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${emailNotifications ? "bg-[var(--savanna-500)]" : "bg-[var(--bg-subtle)]"}`}
              onClick={() => setEmailNotifications(!emailNotifications)}
              role="switch"
              type="button"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${emailNotifications ? "translate-x-5" : "translate-x-0"}`}
              />
            </button>
          </label>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Button onClick={handleSave} variant="primary">Save preferences</Button>
          {saved && <span className="text-sm text-[var(--text-success)]">Saved!</span>}
        </div>
      </Card>

      <Card
        aside={<User aria-hidden className="text-[var(--text-secondary)]" size={18} />}
        title="Profile"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-label block text-[var(--text-primary)]" htmlFor="firstName">First name</label>
            <input
              className="input"
              id="firstName"
              onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
              value={profile.firstName}
            />
          </div>
          <div className="space-y-2">
            <label className="text-label block text-[var(--text-primary)]" htmlFor="lastName">Last name</label>
            <input
              className="input"
              id="lastName"
              onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
              value={profile.lastName}
            />
          </div>
          <div className="space-y-2">
            <label className="text-label block text-[var(--text-primary)]" htmlFor="email">Email</label>
            <input className="input" disabled id="email" value={profile.email} />
          </div>
          <div className="space-y-2">
            <label className="text-label block text-[var(--text-primary)]" htmlFor="phone">Phone</label>
            <input
              className="input"
              id="phone"
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="+254…"
              value={profile.phone}
            />
          </div>
          <div className="space-y-2">
            <label className="text-label block text-[var(--text-primary)]" htmlFor="emergencyName">Emergency contact name</label>
            <input
              className="input"
              id="emergencyName"
              onChange={(e) => setProfile({ ...profile, emergencyContactName: e.target.value })}
              value={profile.emergencyContactName}
            />
          </div>
          <div className="space-y-2">
            <label className="text-label block text-[var(--text-primary)]" htmlFor="emergencyPhone">Emergency contact phone</label>
            <input
              className="input"
              id="emergencyPhone"
              onChange={(e) => setProfile({ ...profile, emergencyContactPhone: e.target.value })}
              value={profile.emergencyContactPhone}
            />
          </div>
          <div className="space-y-2">
            <label className="text-label block text-[var(--text-primary)]" htmlFor="language">Preferred language</label>
            <select
              className="input"
              id="language"
              onChange={(e) => setProfile({ ...profile, preferredLanguage: e.target.value })}
              value={profile.preferredLanguage}
            >
              <option value="en">English</option>
              <option value="sw">Swahili</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Button
            onClick={async () => {
              await updateClientProfile({
                firstName: profile.firstName,
                lastName: profile.lastName,
                phone: profile.phone,
                emergencyContactName: profile.emergencyContactName,
                emergencyContactPhone: profile.emergencyContactPhone,
                preferredLanguage: profile.preferredLanguage,
              });
              setProfileSaved(true);
              setTimeout(() => setProfileSaved(false), 2000);
            }}
            variant="primary"
          >
            Save profile
          </Button>
          {profileSaved && <span className="text-sm text-[var(--text-success)]">Saved!</span>}
        </div>
      </Card>
    </>
  );
}
