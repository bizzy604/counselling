import type { ReactNode } from "react";

import { PortalShell } from "@/components/layout/PortalShell";
import { requireRole } from "@/server/auth/session";

export default async function EmployerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireRole("EMPLOYER");

  return (
    <PortalShell
      description="Department-level referrals and aggregate wellness reporting."
      role="employer"
      title="Employer Portal"
      user={user}
    >
      {children}
    </PortalShell>
  );
}
