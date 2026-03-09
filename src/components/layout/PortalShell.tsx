import type { ReactNode } from "react";

import { navigationByRole } from "@/config/navigation";
import { roleThemePreference } from "@/design-system/theme";
import type { RoleSlug, SessionUser } from "@/server/auth/types";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

type PortalShellProps = {
  children: ReactNode;
  description: string;
  role: RoleSlug;
  showSOS?: boolean;
  title: string;
  user: SessionUser;
};

const roleLabels: Record<RoleSlug, string> = {
  client: "Client Portal",
  counsellor: "Counsellor Workspace",
  employer: "Employer Portal",
  admin: "Admin Dashboard",
};

export function PortalShell({
  children,
  description,
  role,
  showSOS = false,
  title,
  user,
}: PortalShellProps) {
  const theme = roleThemePreference[role];

  return (
    <div data-theme={theme}>
      <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
        <Sidebar items={navigationByRole[role]} roleLabel={roleLabels[role]} user={user} />
        <div className="min-w-0">
          <Topbar
            description={description}
            showSOS={showSOS}
            title={title}
            user={user}
          />
          <main className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-7xl flex-col gap-6 px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
