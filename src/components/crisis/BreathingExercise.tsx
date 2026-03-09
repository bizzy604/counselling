"use client";

export function BreathingExercise({ onComplete }: { onComplete?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-8 py-6">
      <div className="flex h-48 w-48 items-center justify-center rounded-full bg-[color:color-mix(in_srgb,var(--savanna-400)_20%,transparent)]">
        <div className="breathing-circle flex h-28 w-28 items-center justify-center rounded-full bg-[var(--savanna-400)]">
          <span className="text-lg font-medium text-white">Breathe</span>
        </div>
      </div>

      <p className="text-center text-[var(--ivory-100)]">
        Inhale for 4 &middot; Hold for 4 &middot; Exhale for 6
      </p>

      <div className="flex gap-3">
        <button
          className="btn btn-md text-white/70 hover:text-white"
          onClick={onComplete}
          type="button"
        >
          Skip
        </button>
        <button
          className="btn btn-md btn-primary"
          onClick={onComplete}
          type="button"
        >
          I feel steadier &rarr;
        </button>
      </div>
    </div>
  );
}
