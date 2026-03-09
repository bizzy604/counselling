"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

const moodOptions = [
  { value: 1, emoji: "😔", label: "Very Low" },
  { value: 2, emoji: "😕", label: "Low" },
  { value: 3, emoji: "😐", label: "Neutral" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "😊", label: "Excellent" },
] as const;

type MoodScaleProps = {
  /** Currently selected value (1-5) */
  value?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
};

export function MoodScale({ disabled, onChange, value }: MoodScaleProps) {
  const [selected, setSelected] = useState(value);

  function handleSelect(v: number) {
    if (disabled) return;
    setSelected(v);
    onChange?.(v);
  }

  return (
    <div className="flex gap-3 rounded-[var(--radius-xl)] bg-[var(--bg-surface-raised)] p-4">
      {moodOptions.map((option) => {
        const isSelected = selected === option.value;
        return (
          <button
            aria-label={option.label}
            aria-pressed={isSelected}
            className={cn(
              "flex flex-1 flex-col items-center gap-2 rounded-[var(--radius-lg)] border-2 border-transparent px-2 py-4 transition-all",
              "cursor-pointer hover:-translate-y-0.5 hover:bg-[var(--bg-subtle)]",
              isSelected &&
                "border-[var(--savanna-400)] bg-[var(--savanna-50)] -translate-y-[3px] shadow-[var(--shadow-brand)]",
              disabled && "cursor-not-allowed opacity-50",
            )}
            disabled={disabled}
            key={option.value}
            onClick={() => handleSelect(option.value)}
            style={{ transition: `background var(--transition-fast), border-color var(--transition-fast), transform var(--transition-spring)` }}
            type="button"
          >
            <span className="text-[2rem] leading-none">{option.emoji}</span>
            <span
              className={cn(
                "text-xs font-medium text-[var(--text-secondary)]",
                isSelected && "text-[var(--savanna-700)]",
              )}
            >
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
