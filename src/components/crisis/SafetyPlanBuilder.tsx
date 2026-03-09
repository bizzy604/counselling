"use client";

import { useState } from "react";

type SafetyPlanBuilderProps = {
  onComplete?: (plan: string[]) => void;
};

const prompts = [
  "Warning signs that a crisis may be developing:",
  "Internal coping strategies — things I can do to take my mind off problems:",
  "People and social settings that provide distraction:",
  "People I can ask for help:",
  "Professionals or agencies I can contact during a crisis:",
  "Making the environment safe — steps I can take:",
];

export function SafetyPlanBuilder({ onComplete }: SafetyPlanBuilderProps) {
  const [answers, setAnswers] = useState<string[]>(Array(prompts.length).fill(""));

  function updateAnswer(index: number, value: string) {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <p className="text-body-sm text-[var(--ivory-200)]">
        A safety plan lists things you can do and people you can contact when you are in
        crisis. Completing each section is optional.
      </p>

      {prompts.map((prompt, index) => (
        <div className="space-y-2" key={index}>
          <label
            className="text-label text-[var(--ivory-100)]"
            htmlFor={`safety-${index}`}
          >
            {index + 1}. {prompt}
          </label>
          <textarea
            className="input min-h-[80px] resize-y border-white/20 bg-white/5 text-white placeholder:text-white/40"
            id={`safety-${index}`}
            onChange={(e) => updateAnswer(index, e.target.value)}
            placeholder="Type here..."
            value={answers[index]}
          />
        </div>
      ))}

      <button
        className="btn btn-md btn-primary w-full justify-center"
        onClick={() => onComplete?.(answers)}
        type="button"
      >
        Save safety plan &rarr;
      </button>
    </div>
  );
}
