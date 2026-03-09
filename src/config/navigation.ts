import type { Route } from "next";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  BookOpen,
  Calendar,
  HeartPulse,
  MessageSquare,
  Shield,
  Users,
} from "lucide-react";

import type { RoleSlug } from "@/server/auth/types";

export type NavigationItem = {
  href: Route;
  label: string;
  icon: LucideIcon;
};

export const navigationByRole: Record<RoleSlug, NavigationItem[]> = {
  client: [
    { href: "/client", label: "Overview", icon: HeartPulse },
    { href: "/client#appointments", label: "Appointments", icon: Calendar },
    { href: "/client#programmes", label: "Programmes", icon: BookOpen },
    { href: "/client#check-in", label: "Mood Check-in", icon: MessageSquare },
    { href: "/client#notifications", label: "Notifications", icon: Bell },
  ],
  counsellor: [
    { href: "/counsellor", label: "Overview", icon: Users },
    { href: "/counsellor#calendar", label: "Calendar", icon: Calendar },
    { href: "/counsellor#clients", label: "Clients", icon: HeartPulse },
    { href: "/counsellor#notes", label: "Session Notes", icon: MessageSquare },
  ],
  employer: [
    { href: "/employer", label: "Overview", icon: BarChart3 },
    { href: "/employer#referrals", label: "Referrals", icon: Users },
    { href: "/employer#reports", label: "Reports", icon: BookOpen },
  ],
  admin: [
    { href: "/admin", label: "Overview", icon: BarChart3 },
    { href: "/admin#queue", label: "Assignment Queue", icon: Users },
    { href: "/admin#content", label: "Content", icon: BookOpen },
    { href: "/admin#safety", label: "Crisis", icon: Shield },
  ],
};
