import Link from "next/link";
import { ArrowRight, BookOpen, Calendar, Shield } from "lucide-react";

import { buttonStyles } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

const highlights = [
  {
    icon: Calendar,
    title: "Direct session booking",
    body: "Choose a service type, see live counsellor slots, and secure an appointment without a paper trail.",
  },
  {
    icon: BookOpen,
    title: "Daily wellness support",
    body: "Mood tracking, guided journaling, breathing tools, and structured wellness programmes in one place.",
  },
  {
    icon: Shield,
    title: "Crisis support pathway",
    body: "A focused SOS experience with grounding, escalation, follow-up, and documented safety controls.",
  },
];

export default function LandingPage() {
  return (
    <main className="relative isolate overflow-hidden">
      <div className="absolute left-[-8rem] top-[-10rem] h-72 w-72 rounded-full bg-[color:color-mix(in_srgb,var(--brand-accent)_18%,transparent)] blur-3xl" />
      <div className="absolute right-[-10rem] top-0 h-96 w-96 rounded-full bg-[color:color-mix(in_srgb,var(--brand-primary)_18%,transparent)] blur-3xl" />

      <section className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center gap-14 px-4 py-16 sm:px-6 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-overline text-[var(--text-brand)]">
              Directorate of Counselling and Wellness Services
            </p>
            <h1 className="text-display-lg mt-5 max-w-4xl text-[var(--text-primary)]">
              Confidential care for public servants, built with grounded warmth.
            </h1>
            <p className="text-body mt-6 max-w-2xl text-[var(--text-secondary)]">
              CWE is a secure digital wellness ecosystem for booking counselling,
              tracking emotional wellbeing, accessing guided support, and reaching
              crisis help without physical exposure.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className={cn(buttonStyles({ size: "lg" }), "w-full sm:w-auto")}
                href="/sign-in"
              >
                <span>Preview secure sign-in</span>
                <ArrowRight aria-hidden="true" size={18} />
              </Link>
              <a
                className={cn(
                  buttonStyles({ size: "lg", variant: "secondary" }),
                  "w-full sm:w-auto",
                )}
                href="#highlights"
              >
                Explore the platform
              </a>
            </div>
          </div>

          <div className="grain ambient-panel rounded-[32px] border border-[var(--border-subtle)] p-6 shadow-[var(--shadow-lg)]">
            <div className="relative overflow-hidden rounded-[24px] bg-[var(--obsidian-900)] p-6 text-[var(--text-inverse)]">
              <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,rgba(69,173,95,0.3),transparent_70%)]" />
              <p className="relative text-overline text-white/70">Client experience</p>
              <h2 className="relative mt-4 font-display text-3xl tracking-[-0.03em]">
                Safe to enter. Quiet to use.
              </h2>
              <div className="relative mt-8 grid gap-4">
                <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
                  <p className="text-label text-white/70">Next session</p>
                  <p className="mt-2 text-xl text-white">Stress Management</p>
                  <p className="mt-1 text-body-sm text-white/70">
                    Wed 11 March 2026, 10:00 AM
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-[18px] border border-white/10 bg-white/5 p-4">
                    <p className="text-caption text-white/60">Streak</p>
                    <p className="mt-2 font-display text-3xl text-white">6</p>
                  </div>
                  <div className="rounded-[18px] border border-white/10 bg-white/5 p-4">
                    <p className="text-caption text-white/60">Assigned</p>
                    <p className="mt-2 font-display text-3xl text-white">5</p>
                  </div>
                  <div className="rounded-[18px] border border-white/10 bg-white/5 p-4">
                    <p className="text-caption text-white/60">Completed</p>
                    <p className="mt-2 font-display text-3xl text-white">3</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="grid gap-5 md:grid-cols-3" id="highlights">
          {highlights.map((highlight) => {
            const Icon = highlight.icon;
            return (
              <Card key={highlight.title}>
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[color:color-mix(in_srgb,var(--brand-primary)_12%,transparent)] text-[var(--text-brand)]">
                  <Icon aria-hidden="true" size={22} />
                </div>
                <h2 className="text-h4 text-[var(--text-primary)]">{highlight.title}</h2>
                <p className="text-body mt-3 text-[var(--text-secondary)]">{highlight.body}</p>
              </Card>
            );
          })}
        </section>
      </section>
    </main>
  );
}
