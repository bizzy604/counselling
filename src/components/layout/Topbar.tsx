import { Bell, LogOut } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { signOutAction } from "@/server/auth/actions";
import type { SessionUser } from "@/server/auth/types";

import { SOSButton } from "./SOSButton";

type TopbarProps = {
  title: string;
  description: string;
  showSOS?: boolean;
  user: SessionUser;
};

export function Topbar({ description, showSOS = false, title, user }: TopbarProps) {
  return (
    <header className="sticky top-0 z-[var(--z-sticky)] border-b border-[var(--border-subtle)] bg-[color:color-mix(in_srgb,var(--bg-base)_92%,transparent)] backdrop-blur">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-10">
        <div className="min-w-0">
          <p className="text-overline text-[var(--text-secondary)]">Secure workspace</p>
          <h1 className="font-display text-2xl font-medium tracking-[-0.03em] text-[var(--text-primary)]">
            {title}
          </h1>
          <p className="text-body-sm text-[var(--text-secondary)]">{description}</p>
        </div>
        <div className="flex items-center gap-3">
          {showSOS ? <SOSButton compact /> : null}
          <button
            aria-label="Notifications"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] transition hover:border-[var(--border-brand)]"
            type="button"
          >
            <Bell aria-hidden="true" size={18} />
          </button>
          <div className="hidden rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-2 text-right md:block">
            <p className="text-label text-[var(--text-primary)]">{`${user.firstName} ${user.lastName}`}</p>
            <p className="text-caption text-[var(--text-secondary)]">{user.role}</p>
          </div>
          <form action={signOutAction}>
            <Button aria-label="Sign out" size="sm" variant="ghost">
              <LogOut aria-hidden="true" size={16} />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
