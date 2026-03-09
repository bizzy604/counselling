import type { ReactNode } from "react";

import { PortalShell } from "@/components/layout/PortalShell";
import { requireRole } from "@/server/auth/session";

export default async function ClientLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireRole("CLIENT");

  return (
    <PortalShell
      description="Confidential self-service support without physical exposure."
      role="client"
      showSOS
      title="Client Dashboard"
      user={user}
    >
      {children}
    </PortalShell>
  );
}
