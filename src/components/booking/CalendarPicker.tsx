"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

type CalendarPickerProps = {
  /** ISO date strings that have available slots */
  availableDates?: string[];
  value?: string;
  onChange?: (isoDate: string) => void;
};

const DAY_NAMES = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function daysInMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

function isoDate(d: Date) {
  return d.toISOString().split("T")[0];
}

export function CalendarPicker({ availableDates = [], onChange, value }: CalendarPickerProps) {
  const [viewing, setViewing] = useState(() => startOfMonth(new Date()));

  const availableSet = useMemo(() => new Set(availableDates), [availableDates]);

  const year = viewing.getFullYear();
  const month = viewing.getMonth();
  const totalDays = daysInMonth(viewing);

  // Monday = 0
  const firstDayOfWeek = ((new Date(year, month, 1).getDay() + 6) % 7);

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null) as null[],
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  const monthLabel = viewing.toLocaleDateString("en-KE", { month: "long", year: "numeric" });

  function prev() {
    setViewing(new Date(year, month - 1, 1));
  }
  function next() {
    setViewing(new Date(year, month + 1, 1));
  }

  return (
    <div className="w-full max-w-sm">
      {/* Month nav */}
      <div className="mb-4 flex items-center justify-between">
        <button
          aria-label="Previous month"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-[var(--bg-subtle)]"
          onClick={prev}
          type="button"
        >
          <ChevronLeft aria-hidden="true" size={18} />
        </button>
        <span className="text-label text-[var(--text-primary)]">{monthLabel}</span>
        <button
          aria-label="Next month"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-[var(--bg-subtle)]"
          onClick={next}
          type="button"
        >
          <ChevronRight aria-hidden="true" size={18} />
        </button>
      </div>

      {/* Day headers */}
      <div className="mb-1 grid grid-cols-7 text-center text-xs font-semibold text-[var(--text-secondary)]">
        {DAY_NAMES.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <span key={`e-${i}`} />;

          const dateStr = isoDate(new Date(year, month, day));
          const isAvailable = availableSet.has(dateStr);
          const isSelected = value === dateStr;

          return (
            <button
              aria-label={new Date(year, month, day).toLocaleDateString("en-KE", {
                day: "numeric",
                month: "short",
              })}
              aria-selected={isSelected}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] text-sm transition",
                isAvailable
                  ? "cursor-pointer bg-[var(--savanna-50)] text-[var(--text-primary)] hover:bg-[var(--savanna-100)]"
                  : "cursor-default text-[var(--text-tertiary)]",
                isSelected &&
                  "bg-[var(--savanna-700)] font-semibold text-white hover:bg-[var(--savanna-800)]",
              )}
              disabled={!isAvailable}
              key={dateStr}
              onClick={() => isAvailable && onChange?.(dateStr)}
              type="button"
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
