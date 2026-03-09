"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

type ModalProps = {
  children: ReactNode;
  onClose: () => void;
  open: boolean;
  title: string;
  /** Render at crisis z-index (SOS flow). */
  crisis?: boolean;
  className?: string;
};

export function Modal({
  children,
  className,
  crisis = false,
  onClose,
  open,
  title,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      previousFocus.current = document.activeElement as HTMLElement;
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
      previousFocus.current?.focus();
    }
  }, [open]);

  return (
    <dialog
      aria-label={title}
      className={cn(
        "m-0 h-full max-h-full w-full max-w-full border-none bg-transparent p-0 backdrop:bg-[var(--bg-overlay)]",
        crisis ? "z-[var(--z-crisis)]" : "z-[var(--z-modal)]",
      )}
      onClose={onClose}
      ref={dialogRef}
    >
      <div
        className={cn(
          "flex min-h-full items-center justify-center p-4",
          crisis && "bg-[var(--jasper-900)]",
        )}
      >
        <div
          className={cn(
            "w-full rounded-[var(--radius-2xl)] shadow-[var(--shadow-xl)]",
            crisis
              ? "max-w-xl bg-[var(--jasper-900)] text-[var(--ivory-50)]"
              : "max-w-lg bg-[var(--bg-surface)] text-[var(--text-primary)]",
            className,
          )}
        >
          <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <h2 className={cn("text-h4", crisis && "font-display text-xl font-medium")}>
              {title}
            </h2>
            <button
              aria-label="Close dialog"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10"
              onClick={onClose}
              type="button"
            >
              <X aria-hidden="true" size={18} />
            </button>
          </header>
          <div className="px-6 py-5">
            {children}
          </div>
        </div>
      </div>
    </dialog>
  );
}
