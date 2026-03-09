import { BookOpen, Calendar, CheckCircle, Lock, MessageSquare, Shield, Users } from "lucide-react";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Calendar,
    title: "Appointment scheduling",
    body: "Book directly with an available counsellor or join the assignment queue. Every booking is confirmed in real time.",
  },
  {
    icon: MessageSquare,
    title: "Mood & journal tools",
    body: "Daily mood check-ins, guided journal prompts, and trend tracking — all stored privately under your account.",
  },
  {
    icon: Shield,
    title: "Crisis support pathway",
    body: "A dedicated SOS flow for moments of distress. Grounding exercises, escalation to on-call staff, and documented follow-up.",
  },
  {
    icon: BookOpen,
    title: "Curated content library",
    body: "Articles and resources assigned by your counsellor or self-selected from the wellness library.",
  },
  {
    icon: Users,
    title: "Employer referral channel",
    body: "Department managers can refer employees confidentially without direct access to clinical records.",
  },
  {
    icon: Lock,
    title: "End-to-end privacy",
    body: "HttpOnly session cookies, role-based access control, and an immutable audit log on every sensitive action.",
  },
];

const steps = [
  { step: "01", title: "Sign in securely", body: "Use your government work email. Sessions are encrypted and cookie-based — no passwords stored in plain text." },
  { step: "02", title: "Complete your profile", body: "Set your language preference, emergency contact, and consent choices. Takes under two minutes." },
  { step: "03", title: "Book or request support", body: "Choose a live counsellor slot for immediate booking, or submit a request that routes through the assignment queue." },
  { step: "04", title: "Track your wellbeing", body: "Log daily moods, write journal entries, and monitor your progress over time through your personal dashboard." },
];

const stats = [
  { value: "4", label: "User roles supported" },
  { value: "5", label: "Service types available" },
  { value: "3", label: "Access pathways" },
  { value: "100%", label: "Confidential records" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)]">

      {/* ── Top navigation ── */}
      <header className="sticky top-0 z-10 border-b border-[var(--border-subtle)] bg-[color:color-mix(in_srgb,var(--bg-base)_92%,transparent)] backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brand-primary)]">
              <span className="text-xs font-bold text-white">CWE</span>
            </div>
            <span className="hidden font-display text-lg font-medium text-[var(--text-primary)] sm:inline">
              Counselling & Wellness
            </span>
          </div>
          <nav className="hidden items-center gap-6 sm:flex">
            <a className="text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]" href="#features">Features</a>
            <a className="text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]" href="#how-it-works">How it works</a>
          </nav>
          <Link
            className={cn(buttonStyles({ size: "sm" }))}
            href="/sign-in"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 lg:px-10 lg:pt-28">
        <div className="max-w-3xl">
          <span className="inline-block rounded-full border border-[var(--border-brand)] bg-[var(--savanna-50)] px-3 py-1 text-xs font-medium text-[var(--text-brand)]">
            Directorate of Counselling and Wellness Services
          </span>
          <h1 className="mt-6 font-display text-5xl font-medium leading-[1.1] tracking-[-0.03em] text-[var(--text-primary)] sm:text-6xl">
            Confidential support<br />
            for public servants.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-[var(--text-secondary)]">
            A secure digital platform for booking counselling, tracking your wellbeing, and accessing crisis help — without a paper trail.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              className={cn(buttonStyles({ size: "lg" }))}
              href="/sign-in"
            >
              Get started
            </Link>
            <a
              className={cn(buttonStyles({ size: "lg", variant: "secondary" }))}
              href="#features"
            >
              Learn more
            </a>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--border-subtle)] sm:grid-cols-4">
          {stats.map((stat) => (
            <div className="bg-[var(--bg-surface)] px-6 py-7" key={stat.label}>
              <p className="font-display text-4xl font-medium text-[var(--text-primary)]">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features grid ── */}
      <section className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]" id="features">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-10">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-medium tracking-[-0.02em] text-[var(--text-primary)]">
              Everything you need in one place.
            </h2>
            <p className="mt-4 text-[var(--text-secondary)]">
              Built around four connected portals — for clients, counsellors, employers, and administrators.
            </p>
          </div>
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--border-subtle)] sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div className="bg-[var(--bg-surface)] p-7" key={feature.title}>
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--savanna-50)] text-[var(--text-brand)]">
                    <Icon aria-hidden="true" size={20} />
                  </div>
                  <h3 className="mt-5 font-medium text-[var(--text-primary)]">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{feature.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="border-t border-[var(--border-subtle)]" id="how-it-works">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-10">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-medium tracking-[-0.02em] text-[var(--text-primary)]">
              Up and running in minutes.
            </h2>
            <p className="mt-4 text-[var(--text-secondary)]">
              The platform is designed for public servants who need quick, private access to support.
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div className="relative" key={step.step}>
                <span className="font-display text-5xl font-medium text-[var(--border-default)]">
                  {step.step}
                </span>
                <h3 className="mt-4 font-medium text-[var(--text-primary)]">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-[var(--border-subtle)] bg-[var(--obsidian-900)]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-10">
          <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-display text-3xl font-medium tracking-[-0.02em] text-white">
                Ready to access support?
              </h2>
              <p className="mt-3 text-white/60">
                Sign in with your government work email to get started.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                className={cn(
                  buttonStyles({ size: "lg" }),
                  "bg-white text-[var(--obsidian-900)] hover:bg-[var(--ivory-100)]",
                )}
                href="/sign-in"
              >
                Sign in to your portal
              </Link>
            </div>
          </div>

          <div className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/10 pt-10">
            {["Role-based access control", "Encrypted session tokens", "Immutable audit log", "No plain-text passwords"].map((item) => (
              <div className="flex items-center gap-2 text-sm text-white/50" key={item}>
                <CheckCircle aria-hidden="true" className="text-[var(--savanna-400)]" size={14} />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

