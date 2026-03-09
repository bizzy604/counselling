import type { Route } from "next";

import type { RoleSlug } from "@/server/auth/types";

export type IconName =
  | "BarChart3"
  | "Bell"
  | "BookOpen"
  | "Calendar"
  | "FileText"
  | "HeartPulse"
  | "MessageSquare"
  | "PenSquare"
  | "Settings"
  | "Shield"
  | "Users";

export type NavigationItem =
  | { kind: "link"; href: Route; label: string; icon: IconName }
  | { kind: "divider" };

export const navigationByRole: Record<RoleSlug, NavigationItem[]> = {
  client: [
    { kind: "link", href: "/client" as Route, label: "Overview", icon: "HeartPulse" },
    { kind: "link", href: "/client/appointments" as Route, label: "Appointments", icon: "Calendar" },
    { kind: "link", href: "/client/mood" as Route, label: "Mood Check-in", icon: "MessageSquare" },
    { kind: "link", href: "/client/journal" as Route, label: "Journal", icon: "PenSquare" },
    { kind: "link", href: "/client/content" as Route, label: "Content Library", icon: "BookOpen" },
    { kind: "link", href: "/client/programmes" as Route, label: "Programmes", icon: "FileText" },
    { kind: "divider" },
    { kind: "link", href: "/client/notifications" as Route, label: "Notifications", icon: "Bell" },
    { kind: "link", href: "/client/settings" as Route, label: "Settings", icon: "Settings" },
  ],
  counsellor: [
    { kind: "link", href: "/counsellor" as Route, label: "Overview", icon: "Users" },
    { kind: "link", href: "/counsellor/calendar" as Route, label: "Calendar", icon: "Calendar" },
    { kind: "link", href: "/counsellor/clients" as Route, label: "Clients", icon: "HeartPulse" },
    { kind: "link", href: "/counsellor/notes" as Route, label: "Session Notes", icon: "MessageSquare" },
    { kind: "link", href: "/counsellor/content" as Route, label: "Content", icon: "BookOpen" },
    { kind: "divider" },
    { kind: "link", href: "/counsellor/settings" as Route, label: "Settings", icon: "Settings" },
  ],
  employer: [
    { kind: "link", href: "/employer" as Route, label: "Overview", icon: "BarChart3" },
    { kind: "link", href: "/employer/referrals" as Route, label: "Referrals", icon: "Users" },
    { kind: "link", href: "/employer/reports" as Route, label: "Reports", icon: "FileText" },
  ],
  admin: [
    { kind: "link", href: "/admin" as Route, label: "Overview", icon: "BarChart3" },
    { kind: "link", href: "/admin/analytics" as Route, label: "Analytics", icon: "BarChart3" },
    { kind: "link", href: "/admin/content" as Route, label: "Content", icon: "BookOpen" },
    { kind: "link", href: "/admin/users" as Route, label: "Users", icon: "Users" },
    { kind: "link", href: "/admin/crisis" as Route, label: "Crisis", icon: "Shield" },
    { kind: "link", href: "/admin/audit" as Route, label: "Audit Log", icon: "Shield" },
    { kind: "link", href: "/admin/reports" as Route, label: "Reports", icon: "FileText" },
    { kind: "divider" },
    { kind: "link", href: "/admin/settings" as Route, label: "Settings", icon: "Settings" },
  ],
};
