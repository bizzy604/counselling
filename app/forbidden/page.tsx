import Link from "next/link";

import { Card } from "@/components/ui/Card";

export default function ForbiddenPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-12 sm:px-6 lg:px-10">
      <Card className="ambient-panel w-full">
        <p className="text-overline text-[var(--text-brand)]">Access denied</p>
        <h1 className="text-h2 mt-3 text-[var(--text-primary)]">
          Your role does not have access to this workspace.
        </h1>
        <p className="text-body mt-4 text-[var(--text-secondary)]">
          Sign in with an authorised account or return to the correct role portal.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="btn btn-primary btn-md" href="/sign-in">
            Sign in again
          </Link>
          <Link className="btn btn-secondary btn-md" href="/">
            Back to landing page
          </Link>
        </div>
      </Card>
    </main>
  );
}
