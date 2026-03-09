"use client";

import { useState } from "react";
import { Check } from "lucide-react";

import { assignContent } from "@/server/actions";

type Props = {
  contentId: string;
  clients: { id: string; name: string }[];
};

export function ContentAssignButton({ contentId, clients }: Props) {
  const [open, setOpen] = useState(false);
  const [assigned, setAssigned] = useState(false);

  async function handleAssign(clientId: string) {
    await assignContent(contentId, clientId);
    setAssigned(true);
    setOpen(false);
    setTimeout(() => setAssigned(false), 2000);
  }

  if (clients.length === 0) {
    return (
      <span className="text-body-sm text-[var(--text-tertiary)]">No clients</span>
    );
  }

  return (
    <div className="relative">
      {assigned ? (
        <span className="btn btn-sm btn-ghost text-[var(--text-success)]">
          <Check aria-hidden size={14} /> Assigned
        </span>
      ) : (
        <button
          className="btn btn-sm btn-primary"
          onClick={() => setOpen(!open)}
          type="button"
        >
          Assign
        </button>
      )}
      {open && (
        <div className="absolute right-0 top-full z-10 mt-1 w-56 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-lg">
          <div className="p-2">
            <p className="mb-1 px-2 text-xs font-semibold uppercase text-[var(--text-secondary)]">
              Select client
            </p>
            {clients.map((c) => (
              <button
                className="w-full rounded-[var(--radius-md)] px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)]"
                key={c.id}
                onClick={() => handleAssign(c.id)}
                type="button"
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
