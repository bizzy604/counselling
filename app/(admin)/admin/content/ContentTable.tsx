"use client";

import { useState } from "react";
import { BookOpen, Plus, X } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { addContent, editContent } from "@/server/actions";

type ContentItem = {
  id: string;
  title: string;
  category: string;
  status: "published" | "draft" | "archived";
  updatedAt: string;
};

const statusVariant: Record<string, "active" | "inactive" | "pending"> = {
  published: "active",
  draft: "pending",
  archived: "inactive",
};

const statusValues = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

function ContentModal({
  item,
  onClose,
  onSaved,
}: {
  item?: ContentItem;
  onClose: () => void;
  onSaved: (c: ContentItem) => void;
}) {
  const isEdit = !!item;
  const [form, setForm] = useState({
    title: item?.title ?? "",
    category: item?.category ?? "",
    body: "",
    status: (item?.status?.toUpperCase() ?? "DRAFT") as (typeof statusValues)[number],
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit && item) {
        const updated = await editContent(item.id, {
          title: form.title,
          category: form.category,
          status: form.status,
          body: form.body || undefined,
        });
        onSaved(updated);
      } else {
        const created = await addContent({
          title: form.title,
          category: form.category,
          status: form.status,
          body: form.body || undefined,
        });
        onSaved(created);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-[var(--radius-2xl)] bg-[var(--bg-surface)] p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-h3 text-[var(--text-primary)]">
            {isEdit ? "Edit content" : "New content"}
          </h2>
          <button className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-label mb-1 block text-[var(--text-primary)]" htmlFor="title">Title</label>
            <input className="input" id="title" onChange={(e) => setForm({ ...form, title: e.target.value })} required value={form.title} />
          </div>
          <div>
            <label className="text-label mb-1 block text-[var(--text-primary)]" htmlFor="category">Category</label>
            <input className="input" id="category" onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Stress Management, Mindfulness" required value={form.category} />
          </div>
          <div>
            <label className="text-label mb-1 block text-[var(--text-primary)]" htmlFor="body">Body</label>
            <textarea className="input min-h-[120px]" id="body" onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Content body…" value={form.body} />
          </div>
          <div>
            <label className="text-label mb-1 block text-[var(--text-primary)]" htmlFor="status">Status</label>
            <select className="input" id="status" onChange={(e) => setForm({ ...form, status: e.target.value as (typeof statusValues)[number] })} value={form.status}>
              {statusValues.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={onClose} type="button" variant="ghost">Cancel</Button>
            <Button disabled={saving} type="submit" variant="primary">{saving ? "Saving…" : isEdit ? "Save" : "Create"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ContentTable({ initialItems }: { initialItems: ContentItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [modal, setModal] = useState<{ mode: "add" | "edit"; item?: ContentItem } | null>(null);

  return (
    <>
      <header className="mb-2 flex items-center justify-between">
        <div>
          <h1 className="text-h2 text-[var(--text-primary)]">Content Management</h1>
          <p className="text-body mt-1 text-[var(--text-secondary)]">
            Create, edit, publish, and archive wellness content.
          </p>
        </div>
        <button className="btn btn-md btn-primary" onClick={() => setModal({ mode: "add" })} type="button">
          <Plus aria-hidden size={16} /> New content
        </button>
      </header>

      <div className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5">
        <div className="mb-3 flex items-center gap-2">
          <BookOpen aria-hidden className="text-[var(--text-secondary)]" size={18} />
          <h2 className="text-label text-[var(--text-primary)]">{items.length} items</h2>
        </div>
        <div className="space-y-3">
          {items.map((item) => (
            <div
              className="flex items-center justify-between rounded-[var(--radius-lg)] border border-[var(--border-subtle)] p-4 transition-colors hover:bg-[var(--bg-surface-raised)]"
              key={item.id}
            >
              <div>
                <p className="text-label text-[var(--text-primary)]">{item.title}</p>
                <p className="text-body-sm mt-1 text-[var(--text-tertiary)]">
                  {item.category} &middot; Updated {item.updatedAt}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={statusVariant[item.status]}>{item.status}</Badge>
                <button className="btn btn-sm btn-ghost" onClick={() => setModal({ mode: "edit", item })} type="button">Edit</button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="py-6 text-center text-[var(--text-tertiary)]">
              No content items yet. Click &ldquo;New content&rdquo; to create one.
            </p>
          )}
        </div>
      </div>

      {modal && (
        <ContentModal
          item={modal.item}
          onClose={() => setModal(null)}
          onSaved={(savedItem) => {
            if (modal.mode === "add") {
              setItems((prev) => [savedItem, ...prev]);
            } else {
              setItems((prev) => prev.map((i) => (i.id === savedItem.id ? savedItem : i)));
            }
            setModal(null);
          }}
        />
      )}
    </>
  );
}
