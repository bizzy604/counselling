import type { ReactNode } from "react";

import { PortalShell } from "@/components/layout/PortalShell";
import { requireRole } from "@/server/auth/session";

export default async function CounsellorLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireRole("COUNSELLOR");

  return (
    <PortalShell
      description="Private case-management workspace for assigned clients."
      role="counsellor"
      title="Counsellor Workspace"
      user={user}
    >
      {children}
    </PortalShell>
  );
}
