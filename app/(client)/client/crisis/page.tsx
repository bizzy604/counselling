"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CrisisModal } from "@/components/crisis/CrisisModal";

export default function CrisisPage() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="mb-2">
        <h1 className="text-h2 text-[var(--text-primary)]">Crisis Support</h1>
        <p className="text-body mt-1 text-[var(--text-secondary)]">
          Immediate support when you need it most. This page guides you through a
          structured safety process.
        </p>
      </header>

      <Card>
        <div className="flex flex-col items-center gap-6 py-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--jasper-100)] text-[var(--jasper-700)]">
            <span className="text-3xl">🆘</span>
          </div>
          <div>
            <h2 className="text-h3 text-[var(--text-primary)]">Are you in crisis?</h2>
            <p className="text-body mt-2 max-w-md text-[var(--text-secondary)]">
              If you or someone you know is in immediate danger, please call emergency
              services (999 / 112) or use the guided crisis flow below.
            </p>
          </div>
          <Button onClick={() => setOpen(true)} variant="primary">Start crisis support</Button>
          <CrisisModal onClose={() => setOpen(false)} open={open} />
        </div>
      </Card>

      <Card title="Emergency contacts">
        <div className="space-y-3">
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] p-4">
            <p className="text-label text-[var(--text-primary)]">Befrienders Kenya</p>
            <p className="text-body-sm text-[var(--text-secondary)]">+254 722 178 177</p>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] p-4">
            <p className="text-label text-[var(--text-primary)]">Kenya Red Cross</p>
            <p className="text-body-sm text-[var(--text-secondary)]">1199</p>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] p-4">
            <p className="text-label text-[var(--text-primary)]">National Emergency</p>
            <p className="text-body-sm text-[var(--text-secondary)]">999 / 112</p>
          </div>
        </div>
      </Card>
    </>
  );
}
