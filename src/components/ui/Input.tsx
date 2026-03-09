import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export function Input({
  className,
  error,
  hint,
  id,
  label,
  ...props
}: InputProps) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-2">
      <label className="text-label block text-[var(--text-primary)]" htmlFor={id}>
        {label}
      </label>
      <input
        aria-describedby={describedBy || undefined}
        aria-invalid={Boolean(error)}
        className={cn("input", className)}
        id={id}
        {...props}
      />
      {hint ? (
        <p className="text-body-sm text-[var(--text-secondary)]" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="text-body-sm text-[var(--text-danger)]" id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
