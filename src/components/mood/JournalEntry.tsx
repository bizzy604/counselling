"use client";

import { useEffect, useRef, useState } from "react";

type JournalEntryProps = {
  /** Initial text value */
  defaultValue?: string;
  /** Called on every change with the current text */
  onChange?: (text: string) => void;
  /** Maximum character count */
  maxLength?: number;
  placeholder?: string;
};

export function JournalEntry({
  defaultValue = "",
  maxLength = 5000,
  onChange,
  placeholder = "Write your thoughts here…",
}: JournalEntryProps) {
  const [text, setText] = useState(defaultValue);
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Auto-save every 30 seconds
  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (text.length > 0) {
        onChange?.(text);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    }, 30_000);
    return () => clearInterval(timerRef.current);
  }, [text, onChange]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-label text-[var(--text-primary)]" htmlFor="journal-entry">
          Journal entry
        </label>
        {saved && (
          <span
            aria-live="polite"
            className="text-xs text-[var(--text-success)]"
          >
            Auto-saved
          </span>
        )}
      </div>
      <textarea
        className="input min-h-[180px] resize-y leading-relaxed"
        id="journal-entry"
        maxLength={maxLength}
        onChange={(e) => {
          setText(e.target.value);
          onChange?.(e.target.value);
        }}
        placeholder={placeholder}
        value={text}
      />
      <p className="text-xs text-[var(--text-tertiary)]">
        {text.length.toLocaleString()} / {maxLength.toLocaleString()} characters
      </p>
    </div>
  );
}
