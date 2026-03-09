"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

type ToastVariant = "success" | "danger" | "warning";

type ToastItem = {
  id: string;
  message: string;
  variant: ToastVariant;
};

const variantBorder: Record<ToastVariant, string> = {
  success: "border-l-[var(--savanna-400)]",
  danger: "border-l-[var(--jasper-500)]",
  warning: "border-l-[var(--sienna-400)]",
};

type ToastContextValue = {
  toast: (message: string, variant?: ToastVariant) => void;
};

let globalToast: ToastContextValue["toast"] | null = null;

/** Fire-and-forget toast from anywhere (client only). */
export function showToast(message: string, variant: ToastVariant = "success") {
  globalToast?.(message, variant);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, variant: ToastVariant = "success") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, variant }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    globalToast = addToast;
    return () => { globalToast = null; };
  }, [addToast]);

  return (
    <>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-6 right-6 z-[var(--z-toast)] flex flex-col gap-3"
      >
        {toasts.map((t) => (
          <ToastCard key={t.id} onDismiss={removeToast} toast={t} />
        ))}
      </div>
    </>
  );
}

function ToastCard({
  onDismiss,
  toast,
}: {
  onDismiss: (id: string) => void;
  toast: ToastItem;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 5000);
    return () => clearTimeout(timer);
  }, [onDismiss, toast.id]);

  return (
    <div
      className={cn(
        "flex min-w-[320px] max-w-[420px] items-start gap-3 rounded-[var(--radius-lg)] border-l-[3px] bg-[var(--obsidian-900)] px-5 py-4 text-[var(--ivory-100)] shadow-[var(--shadow-xl)]",
        variantBorder[toast.variant],
      )}
      style={{ animation: "toast-in var(--transition-spring) forwards" }}
    >
      <p className="flex-1 text-body-sm">{toast.message}</p>
      <button
        aria-label="Dismiss"
        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white/60 transition hover:text-white"
        onClick={() => onDismiss(toast.id)}
        type="button"
      >
        <X aria-hidden="true" size={14} />
      </button>
    </div>
  );
}
