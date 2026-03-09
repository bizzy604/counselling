"use client";

import { useState } from "react";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { addUser, editUser } from "@/server/actions";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
};

const roleVariant: Record<string, "active" | "pending" | "inactive" | "crisis"> = {
  CLIENT: "active",
  COUNSELLOR: "pending",
  EMPLOYER: "inactive",
  ADMIN: "crisis",
};

const roles = ["CLIENT", "COUNSELLOR", "EMPLOYER", "ADMIN"] as const;

function UserModal({
  user,
  onClose,
  onSaved,
}: {
  user?: User;
  onClose: () => void;
  onSaved: (u: User) => void;
}) {
  const isEdit = !!user;
  const [form, setForm] = useState({
    firstName: user?.name.split(" ")[0] ?? "",
    lastName: user?.name.split(" ").slice(1).join(" ") ?? "",
    email: user?.email ?? "",
    role: (user?.role ?? "CLIENT") as (typeof roles)[number],
    department: "",
    password: "",
    isActive: user?.status !== "inactive",
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit && user) {
        const updated = await editUser(user.id, {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          role: form.role,
          isActive: form.isActive,
        });
        onSaved(updated);
      } else {
        const created = await addUser({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          role: form.role,
          department: form.department || "General",
          password: form.password,
        });
        onSaved(created);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-[var(--radius-2xl)] bg-[var(--bg-surface)] p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-h3 text-[var(--text-primary)]">
            {isEdit ? "Edit user" : "Add user"}
          </h2>
          <button className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-label mb-1 block text-[var(--text-primary)]" htmlFor="firstName">First name</label>
              <input className="input" id="firstName" onChange={(e) => setForm({ ...form, firstName: e.target.value })} required value={form.firstName} />
            </div>
            <div>
              <label className="text-label mb-1 block text-[var(--text-primary)]" htmlFor="lastName">Last name</label>
              <input className="input" id="lastName" onChange={(e) => setForm({ ...form, lastName: e.target.value })} required value={form.lastName} />
            </div>
          </div>
          <div>
            <label className="text-label mb-1 block text-[var(--text-primary)]" htmlFor="email">Email</label>
            <input className="input" id="email" onChange={(e) => setForm({ ...form, email: e.target.value })} required type="email" value={form.email} />
          </div>
          <div>
            <label className="text-label mb-1 block text-[var(--text-primary)]" htmlFor="role">Role</label>
            <select className="input" id="role" onChange={(e) => setForm({ ...form, role: e.target.value as (typeof roles)[number] })} value={form.role}>
              {roles.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          {!isEdit && (
            <>
              <div>
                <label className="text-label mb-1 block text-[var(--text-primary)]" htmlFor="department">Department</label>
                <input className="input" id="department" onChange={(e) => setForm({ ...form, department: e.target.value })} required value={form.department} />
              </div>
              <div>
                <label className="text-label mb-1 block text-[var(--text-primary)]" htmlFor="password">Password</label>
                <input className="input" id="password" minLength={8} onChange={(e) => setForm({ ...form, password: e.target.value })} required type="password" value={form.password} />
              </div>
            </>
          )}
          {isEdit && (
            <label className="flex items-center gap-2">
              <input checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} type="checkbox" />
              <span className="text-body text-[var(--text-primary)]">Active</span>
            </label>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={onClose} type="button" variant="ghost">Cancel</Button>
            <Button disabled={saving} type="submit" variant="primary">{saving ? "Saving…" : isEdit ? "Save" : "Create"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function UserTable({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [modal, setModal] = useState<{ mode: "add" | "edit"; user?: User } | null>(null);

  return (
    <>
      <header className="mb-2 flex items-center justify-between">
        <div>
          <h1 className="text-h2 text-[var(--text-primary)]">User Management</h1>
          <p className="text-body mt-1 text-[var(--text-secondary)]">
            Manage platform users across all roles.
          </p>
        </div>
        <button className="btn btn-md btn-primary" onClick={() => setModal({ mode: "add" })} type="button">Add user</button>
      </header>

      <div className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-[var(--text-secondary)]">
            <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </span>
          <h2 className="text-label text-[var(--text-primary)]">{users.length} users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="border-b border-[var(--border-default)]">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Name</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Email</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Role</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Status</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr className="border-b border-[var(--border-subtle)] last:border-b-0" key={u.id}>
                  <td className="px-3 py-3 text-[var(--text-primary)]">{u.name}</td>
                  <td className="px-3 py-3 text-[var(--text-secondary)]">{u.email}</td>
                  <td className="px-3 py-3">
                    <Badge variant={roleVariant[u.role]}>{u.role}</Badge>
                  </td>
                  <td className="px-3 py-3">
                    <Badge variant={u.status === "active" ? "active" : "inactive"}>{u.status}</Badge>
                  </td>
                  <td className="px-3 py-3">
                    <button className="btn btn-sm btn-ghost" onClick={() => setModal({ mode: "edit", user: u })} type="button">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <UserModal
          onClose={() => setModal(null)}
          onSaved={(savedUser) => {
            if (modal.mode === "add") {
              setUsers((prev) => [savedUser, ...prev]);
            } else {
              setUsers((prev) => prev.map((u) => (u.id === savedUser.id ? savedUser : u)));
            }
            setModal(null);
          }}
          user={modal.user}
        />
      )}
    </>
  );
}
