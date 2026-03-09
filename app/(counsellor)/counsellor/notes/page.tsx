"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { SessionNoteEditor } from "@/components/counsellor/SessionNoteEditor";
import { submitSessionNote, lockNote, loadMyClients } from "@/server/actions";

type Note = {
  id: string;
  clientName: string;
  content: string;
  isLocked: boolean;
  createdAt: string;
};

type ClientOption = { id: string; name: string };

export default function SessionNotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");

  useEffect(() => {
    fetch("/v1/notes")
      .then((r) => r.json())
      .then((json) => setNotes(json.data ?? []));
    loadMyClients().then(setClients);
  }, []);

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  return (
    <>
      <header className="mb-2">
        <h1 className="text-h2 text-[var(--text-primary)]">Session Notes</h1>
        <p className="text-body mt-1 text-[var(--text-secondary)]">
          View and create session notes for your clients. Once locked, notes cannot be
          edited.
        </p>
      </header>

      <Card title="New session note">
        <div className="mb-4">
          <label className="text-label mb-1 block text-[var(--text-primary)]" htmlFor="client-select">
            Client
          </label>
          <select
            className="input"
            id="client-select"
            onChange={(e) => setSelectedClientId(e.target.value)}
            value={selectedClientId}
          >
            <option value="">Select a client…</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <SessionNoteEditor
          clientName={selectedClient?.name ?? "Select a client"}
          sessionDate={new Date().toISOString().slice(0, 10)}
          onLock={async () => {}}
          onSave={async (content) => {
            if (!content || !selectedClientId) return;
            const note = await submitSessionNote({
              clientId: selectedClientId,
              content: typeof content === "string" ? content : "",
            });
            setNotes((prev) => [note, ...prev]);
          }}
        />
      </Card>

      <Card title="Recent notes">
        {notes.length === 0 ? (
          <p className="text-body text-[var(--text-tertiary)]">
            No session notes yet.
          </p>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] p-4" key={note.id}>
                <div className="flex items-center justify-between">
                  <p className="text-label text-[var(--text-primary)]">{note.clientName}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant={note.isLocked ? "inactive" : "active"}>
                      {note.isLocked ? "Locked" : "Draft"}
                    </Badge>
                    {!note.isLocked && (
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={async () => {
                          const ok = await lockNote(note.id);
                          if (ok) {
                            setNotes((prev) =>
                              prev.map((n) =>
                                n.id === note.id ? { ...n, isLocked: true } : n,
                              ),
                            );
                          }
                        }}
                        type="button"
                      >
                        Lock
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-body mt-2 text-[var(--text-secondary)]">{note.content}</p>
                <p className="text-body-sm mt-2 text-[var(--text-tertiary)]">
                  {new Date(note.createdAt).toLocaleDateString("en-KE", { dateStyle: "medium" })}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
