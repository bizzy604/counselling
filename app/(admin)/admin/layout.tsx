import type { ReactNode } from "react";

import { PortalShell } from "@/components/layout/PortalShell";
import { requireRole } from "@/server/auth/session";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireRole("ADMIN");

  return (
    <PortalShell
      description="Governance, assignment, content oversight, and platform analytics."
      role="admin"
      title="Admin Dashboard"
      user={user}
    >
      {children}
    </PortalShell>
  );
}
