"use client";

import { useEffect, useRef, useState } from "react";
import { Lock, Save } from "lucide-react";

import { Badge } from "@/components/ui/Badge";

type SessionNoteEditorProps = {
  clientName: string;
  sessionDate: string;
  defaultValue?: string;
  locked?: boolean;
  onSave?: (text: string) => void;
  onLock?: () => void;
};

export function SessionNoteEditor({
  clientName,
  defaultValue = "",
  locked = false,
  onLock,
  onSave,
  sessionDate,
}: SessionNoteEditorProps) {
  const [text, setText] = useState(defaultValue);
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Auto-save every 30 seconds while editing
  useEffect(() => {
    if (locked) return;
    timerRef.current = setInterval(() => {
      if (text.length > 0) {
        onSave?.(text);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    }, 30_000);
    return () => clearInterval(timerRef.current);
  }, [text, locked, onSave]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-h4 text-[var(--text-primary)]">Session note</p>
          <p className="text-body-sm text-[var(--text-secondary)]">
            {clientName} &middot; {sessionDate}
          </p>
        </div>
        <Badge variant={locked ? "complete" : "pending"}>
          {locked ? "Locked" : "Draft"}
        </Badge>
      </div>

      {locked ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] p-4">
          <p className="text-body whitespace-pre-wrap text-[var(--text-primary)]">{text}</p>
        </div>
      ) : (
        <textarea
          className="input min-h-[240px] resize-y leading-relaxed"
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your session notes here..."
          value={text}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          {saved && (
            <span aria-live="polite" className="text-xs text-[var(--text-success)]">
              Auto-saved
            </span>
          )}
        </div>
        {!locked && (
          <div className="flex gap-3">
            <button
              className="btn btn-md btn-secondary"
              onClick={() => {
                onSave?.(text);
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
              }}
              type="button"
            >
              <Save aria-hidden="true" size={16} />
              Save draft
            </button>
            <button
              className="btn btn-md btn-danger"
              onClick={onLock}
              type="button"
            >
              <Lock aria-hidden="true" size={16} />
              Lock note
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
