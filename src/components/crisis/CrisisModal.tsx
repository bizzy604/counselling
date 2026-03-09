"use client";

import { useState } from "react";
import { Shield } from "lucide-react";

import { submitCrisisEvent } from "@/server/actions";
import { BreathingExercise } from "./BreathingExercise";
import { SafetyPlanBuilder } from "./SafetyPlanBuilder";

const TOTAL_STEPS = 9;

const emergencyContacts = [
  { name: "Befrienders Kenya", number: "+254 722 178 177" },
  { name: "Kenya Red Cross", number: "1199" },
  { name: "Emergency Services", number: "999 / 112" },
];

type CrisisModalProps = {
  open: boolean;
  onClose: () => void;
};

export function CrisisModal({ onClose, open }: CrisisModalProps) {
  const [step, setStep] = useState(1);
  const [crisisNotes, setCrisisNotes] = useState("");
  const [persisted, setPersisted] = useState(false);

  function nextStep() {
    if (step < TOTAL_STEPS) setStep((s) => s + 1);
  }

  async function persistAndContinue() {
    if (!persisted) {
      await submitCrisisEvent({ severity: "HIGH", notes: crisisNotes || undefined });
      setPersisted(true);
    }
    nextStep();
  }

  function exitSafely() {
    setStep(1);
    setCrisisNotes("");
    setPersisted(false);
    onClose();
  }

  if (!open) return null;

  return (
    <div
      aria-label="Crisis support flow"
      aria-modal="true"
      className="fixed inset-0 z-[var(--z-crisis)] flex items-center justify-center overflow-y-auto bg-[var(--jasper-900)] p-4"
      role="dialog"
    >
      <div className="w-full max-w-xl">
        {/* Step indicator */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[var(--ivory-100)]">
            <Shield aria-hidden="true" size={20} />
            <span className="text-label">You are safe here</span>
          </div>
          <span className="text-body-sm text-[var(--ivory-200)]">
            Step {step} of {TOTAL_STEPS}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-8 h-1 overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-[var(--savanna-400)] transition-all duration-300"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>

        {/* Step content */}
        <div className="rounded-[var(--radius-2xl)] bg-white/5 p-6">
          {step === 1 && <StepAssessment onNext={nextStep} />}
          {step === 2 && <StepSafety onNext={nextStep} />}
          {step === 3 && <BreathingExercise onComplete={nextStep} />}
          {step === 4 && <StepProblemExploration onNext={nextStep} onNotesChange={setCrisisNotes} />}
          {step === 5 && <StepSupportActivation onNext={nextStep} />}
          {step === 6 && <SafetyPlanBuilder onComplete={nextStep} />}
          {step === 7 && <StepAutoReferral onNext={persistAndContinue} />}
          {step === 8 && <StepDocumentation onNext={nextStep} />}
          {step === 9 && <StepFollowUp onDone={exitSafely} />}
        </div>

        {/* Exit safely */}
        <div className="mt-6 text-center">
          <button
            className="text-body-sm text-[var(--ivory-200)] underline underline-offset-4 transition hover:text-white"
            onClick={exitSafely}
            type="button"
          >
            Exit safely
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Individual step components ── */

function StepAssessment({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-6">
      <h3 className="font-display text-xl font-medium text-[var(--ivory-50)]">
        Assessment
      </h3>
      <p className="text-body-sm text-[var(--ivory-200)]">
        We want to understand how you&apos;re feeling right now.
      </p>
      <p className="text-body text-[var(--ivory-100)]">
        Over the last 2 weeks, how often have you felt little interest or pleasure in
        things?
      </p>
      <fieldset className="space-y-3">
        {["Not at all", "Several days", "More than half the days", "Nearly every day"].map(
          (label) => (
            <label
              className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border border-white/10 px-4 py-3 text-body-sm text-[var(--ivory-100)] transition hover:bg-white/5"
              key={label}
            >
              <input
                className="h-4 w-4 accent-[var(--jasper-400)]"
                name="assessment-q1"
                type="radio"
                value={label}
              />
              {label}
            </label>
          ),
        )}
      </fieldset>
      <button className="btn btn-md btn-primary" onClick={onNext} type="button">
        Next step &rarr;
      </button>
    </div>
  );
}

function StepSafety({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-6">
      <h3 className="font-display text-xl font-medium text-[var(--ivory-50)]">
        Your immediate safety
      </h3>
      <p className="text-body text-[var(--ivory-100)]">
        Are you currently in a safe place?
      </p>
      <div className="flex gap-3">
        <button className="btn btn-md btn-primary flex-1" onClick={onNext} type="button">
          Yes, I am safe
        </button>
        <button className="btn btn-md btn-danger flex-1" onClick={onNext} type="button">
          I need help now
        </button>
      </div>
      <div className="rounded-[var(--radius-lg)] border border-[var(--jasper-400)] bg-[var(--jasper-800)] p-4">
        <p className="text-label text-[var(--ivory-100)]">
          If you are in immediate danger, please call:
        </p>
        <ul className="mt-3 space-y-2">
          {emergencyContacts.map((c) => (
            <li className="text-body-sm text-[var(--ivory-200)]" key={c.name}>
              <strong>{c.name}:</strong> {c.number}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function StepProblemExploration({ onNext, onNotesChange }: { onNext: () => void; onNotesChange: (val: string) => void }) {
  return (
    <div className="space-y-6">
      <h3 className="font-display text-xl font-medium text-[var(--ivory-50)]">
        What&apos;s happening?
      </h3>
      <p className="text-body-sm text-[var(--ivory-200)]">
        Take a moment to share what brought you here today. This is confidential and
        will be part of your crisis record.
      </p>
      <textarea
        className="input min-h-[120px] resize-y border-white/20 bg-white/5 text-white placeholder:text-white/40"
        onChange={(e) => onNotesChange(e.target.value)}
        placeholder="Write as much or as little as you need..."
      />
      <button className="btn btn-md btn-primary" onClick={onNext} type="button">
        Continue &rarr;
      </button>
    </div>
  );
}

function StepSupportActivation({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-6">
      <h3 className="font-display text-xl font-medium text-[var(--ivory-50)]">
        Support contacts
      </h3>
      <p className="text-body-sm text-[var(--ivory-200)]">
        Regardless of counsellor availability, these resources are here for you right now.
      </p>
      <div className="space-y-3">
        {emergencyContacts.map((c) => (
          <div
            className="rounded-[var(--radius-lg)] border border-white/10 bg-white/5 p-4"
            key={c.name}
          >
            <p className="text-label text-[var(--ivory-100)]">{c.name}</p>
            <p className="mt-1 font-mono text-lg text-[var(--savanna-300)]">{c.number}</p>
          </div>
        ))}
      </div>
      <button className="btn btn-md btn-primary" onClick={onNext} type="button">
        Continue &rarr;
      </button>
    </div>
  );
}

function StepAutoReferral({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-6">
      <h3 className="font-display text-xl font-medium text-[var(--ivory-50)]">
        Automatic referral
      </h3>
      <p className="text-body text-[var(--ivory-100)]">
        A crisis referral has been automatically created. A counsellor will be assigned
        to follow up with you as soon as possible.
      </p>
      <div className="rounded-[var(--radius-lg)] border border-[var(--savanna-400)] bg-[color:color-mix(in_srgb,var(--savanna-900)_40%,transparent)] p-4">
        <p className="text-body-sm text-[var(--savanna-200)]">
          Referral status: <strong>Pending assignment</strong>
        </p>
      </div>
      <button className="btn btn-md btn-primary" onClick={onNext} type="button">
        Continue &rarr;
      </button>
    </div>
  );
}

function StepDocumentation({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-6">
      <h3 className="font-display text-xl font-medium text-[var(--ivory-50)]">
        Documentation
      </h3>
      <p className="text-body text-[var(--ivory-100)]">
        An immutable crisis incident record has been created and attached to your case
        file. This record is visible to your assigned counsellor and the Directorate
        administrator.
      </p>
      <p className="text-body-sm text-[var(--ivory-200)]">
        You cannot edit this record, which ensures the integrity of the crisis
        documentation.
      </p>
      <button className="btn btn-md btn-primary" onClick={onNext} type="button">
        Continue &rarr;
      </button>
    </div>
  );
}

function StepFollowUp({ onDone }: { onDone: () => void }) {
  return (
    <div className="space-y-6">
      <h3 className="font-display text-xl font-medium text-[var(--ivory-50)]">
        Follow-up
      </h3>
      <p className="text-body text-[var(--ivory-100)]">
        A follow-up session will be scheduled within the next 24-48 hours. You will
        receive a notification when your counsellor confirms the time.
      </p>
      <p className="text-body-sm text-[var(--ivory-200)]">
        Remember: you can reach emergency contacts at any time, and you can re-enter
        this crisis flow whenever you need.
      </p>
      <button
        className="btn btn-lg btn-primary w-full justify-center"
        onClick={onDone}
        type="button"
      >
        Close crisis flow
      </button>
    </div>
  );
}
