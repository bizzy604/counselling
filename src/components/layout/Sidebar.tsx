"use client";

import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  BookOpen,
  Calendar,
  FileText,
  HeartPulse,
  MessageSquare,
  PenSquare,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { IconName, NavigationItem } from "@/config/navigation";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/server/auth/types";

const iconMap: Record<IconName, LucideIcon> = {
  BarChart3,
  Bell,
  BookOpen,
  Calendar,
  FileText,
  HeartPulse,
  MessageSquare,
  PenSquare,
  Settings,
  Shield,
  Users,
};

type SidebarProps = {
  items: NavigationItem[];
  roleLabel: string;
  user: SessionUser;
};

export function Sidebar({ items, roleLabel, user }: SidebarProps) {
  const pathname = usePathname();
  const linkItems = items.filter((i): i is Extract<NavigationItem, { kind: "link" }> => i.kind === "link");

  return (
    <aside className="bg-[var(--bg-inverse)] text-[var(--text-inverse)] lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-56 lg:flex-col lg:border-r lg:border-white/10">
      <div className="hidden px-5 py-6 lg:block">
        <h1 className="font-display text-2xl font-medium tracking-[-0.03em] text-white">
          CWE
        </h1>
        <p className="mt-1 text-body-sm text-white/50">{roleLabel}</p>
      </div>

      {/* Desktop nav with dividers */}
      <nav
        aria-label={`${roleLabel} navigation`}
        className="hidden lg:flex lg:flex-1 lg:flex-col lg:gap-0.5 lg:px-3 lg:py-2"
      >
        {items.map((item, index) => {
          if (item.kind === "divider") {
            return (
              <div
                aria-hidden="true"
                className="my-3 border-t border-white/8"
                key={`divider-${index}`}
              />
            );
          }

          const Icon = iconMap[item.icon];
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href.split("#")[0]));

          return (
            <Link
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
                isActive
                  ? "bg-white/10 font-medium text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white/90",
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

      {/* User info at bottom */}
      <div className="mt-auto hidden border-t border-white/8 px-5 py-4 lg:block">
        <p className="text-sm font-medium text-white">{`${user.firstName} ${user.lastName}`}</p>
        <p className="mt-0.5 text-xs text-white/50">{user.department}</p>
      </div>

      {/* Mobile bottom nav (links only, no dividers) */}
      <nav
        aria-label={`${roleLabel} navigation`}
        className="fixed bottom-0 left-0 right-0 z-[var(--z-sticky)] grid gap-1 border-t border-white/10 bg-[color:color-mix(in_srgb,var(--bg-inverse)_95%,transparent)] px-2 py-2 backdrop-blur lg:hidden"
        style={{ gridTemplateColumns: `repeat(${Math.min(linkItems.length, 5)}, 1fr)` }}
      >
        {linkItems.slice(0, 5).map((item) => {
          const Icon = iconMap[item.icon];
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href.split("#")[0]));

          return (
            <Link
              className={cn(
                "flex flex-col items-center gap-2 rounded-[var(--radius-lg)] px-3 py-3 text-center text-xs transition",
                isActive
                  ? "bg-white/10 font-medium text-[var(--savanna-200)]"
                  : "text-white/72 hover:bg-white/8 hover:text-white",
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
