"use client";

import { useState } from "react";

import { Modal } from "@/components/ui/Modal";

type AssignmentModalProps = {
  open: boolean;
  onClose: () => void;
  requestId: string;
  clientName: string;
  serviceType: string;
  counsellors: { id: string; name: string; openSlots: number }[];
  onAssign?: (data: { counsellorId: string; scheduledAt: string }) => void;
};

export function AssignmentModal({
  clientName,
  counsellors,
  onAssign,
  onClose,
  open,
  requestId,
  serviceType,
}: AssignmentModalProps) {
  const [counsellorId, setCounsellorId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");

  function handleSubmit() {
    if (!counsellorId || !scheduledAt) return;
    onAssign?.({ counsellorId, scheduledAt });
  }

  return (
    <Modal onClose={onClose} open={open} title="Assign Counsellor">
      <div className="space-y-5">
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] p-4">
          <p className="text-label text-[var(--text-secondary)]">Request</p>
          <p className="mt-1 text-body text-[var(--text-primary)]">
            {clientName} &mdash; {serviceType}
          </p>
          <p className="mt-1 font-mono text-xs text-[var(--text-tertiary)]">{requestId}</p>
        </div>

        <div className="space-y-2">
          <label className="text-label block text-[var(--text-primary)]" htmlFor="assign-counsellor">
            Counsellor
          </label>
          <select
            className="input"
            id="assign-counsellor"
            onChange={(e) => setCounsellorId(e.target.value)}
            value={counsellorId}
          >
            <option value="">Select a counsellor</option>
            {counsellors.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.openSlots} open slots)
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-label block text-[var(--text-primary)]" htmlFor="assign-date">
            Session date and time
          </label>
          <input
            className="input"
            id="assign-date"
            onChange={(e) => setScheduledAt(e.target.value)}
            type="datetime-local"
            value={scheduledAt}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button className="btn btn-md btn-ghost" onClick={onClose} type="button">
            Cancel
          </button>
          <button
            className="btn btn-md btn-primary"
            disabled={!counsellorId || !scheduledAt}
            onClick={handleSubmit}
            type="button"
          >
            Assign
          </button>
        </div>
      </div>
    </Modal>
  );
}
