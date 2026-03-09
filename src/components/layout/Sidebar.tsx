import Link from "next/link";

import type { NavigationItem } from "@/config/navigation";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/server/auth/types";

type SidebarProps = {
  items: NavigationItem[];
  roleLabel: string;
  user: SessionUser;
};

export function Sidebar({ items, roleLabel, user }: SidebarProps) {
  return (
    <aside className="bg-[var(--bg-inverse)] text-[var(--text-inverse)] lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-r lg:border-[var(--border-subtle)]">
      <div className="hidden border-b border-white/10 px-6 py-8 lg:block">
        <p className="text-overline text-white/70">Counselling and Wellness Ecosystem</p>
        <h1 className="mt-3 font-display text-3xl font-medium tracking-[-0.03em]">
          CWE
        </h1>
        <p className="mt-4 text-body-sm text-white/70">{roleLabel}</p>
        <div className="mt-6 rounded-[var(--radius-xl)] border border-white/10 bg-white/5 p-4">
          <p className="text-label text-white/60">Signed in as</p>
          <p className="mt-2 text-body text-white">{`${user.firstName} ${user.lastName}`}</p>
          <p className="mt-1 text-body-sm text-white/60">{user.department}</p>
        </div>
      </div>
      <nav
        aria-label={`${roleLabel} navigation`}
        className="fixed bottom-0 left-0 right-0 z-[var(--z-sticky)] grid grid-cols-4 gap-1 border-t border-white/10 bg-[color:color-mix(in_srgb,var(--bg-inverse)_95%,transparent)] px-2 py-2 backdrop-blur lg:static lg:flex lg:flex-1 lg:flex-col lg:gap-2 lg:border-t-0 lg:bg-transparent lg:px-4 lg:py-6"
      >
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              className={cn(
                "flex flex-col items-center gap-2 rounded-[var(--radius-lg)] px-3 py-3 text-center text-xs transition lg:flex-row lg:justify-start lg:text-sm",
                "text-white/72 hover:bg-white/8 hover:text-white",
              )}
              href={item.href}
              key={item.href}
            >
              <Icon aria-hidden="true" size={18} strokeWidth={2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
