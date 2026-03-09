import { ArrowRight, Lock, ShieldCheck, Smartphone } from "lucide-react";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { authPreviewAccounts } from "@/lib/demo-data";
import { signInAction } from "@/server/auth/actions";
import { getSessionUser, homePathForRole } from "@/server/auth/session";

function readSearchParam(value: string | string[] | undefined, fallback = "") {
  if (typeof value === "string") {
    return value;
  }

  return fallback;
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getSessionUser();

  if (user) {
    redirect(homePathForRole(user.role));
  }

  const params = await searchParams;
  const errorMessage = readSearchParam(params.error, "");
  const redirectTo = readSearchParam(params.redirect, "");

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center gap-8 px-4 py-12 sm:px-6 lg:px-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-[32px] bg-[var(--obsidian-900)] p-8 text-[var(--text-inverse)] shadow-[var(--shadow-xl)]">
          <p className="text-overline text-white/70">Account access</p>
          <h1 className="text-h1 mt-4 text-white">
            Email and password sign-in for every workspace.
          </h1>
          <p className="text-body mt-5 max-w-xl text-white/72">
            Authentication is now fully first-party. Each account signs in directly
            with its registered work email and password.
          </p>
          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-3 rounded-[20px] border border-white/10 bg-white/5 p-4">
              <ShieldCheck aria-hidden="true" className="mt-0.5" size={20} />
              <div>
                <p className="text-label text-white">Role-scoped routing</p>
                <p className="text-body-sm mt-1 text-white/70">
                  Valid users land only in their assigned portal. Cross-role access is
                  still blocked.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-[20px] border border-white/10 bg-white/5 p-4">
              <Lock aria-hidden="true" className="mt-0.5" size={20} />
              <div>
                <p className="text-label text-white">Hashed passwords</p>
                <p className="text-body-sm mt-1 text-white/70">
                  Passwords are stored as salted hashes and verified on the server
                  before session issuance.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-[20px] border border-white/10 bg-white/5 p-4">
              <Smartphone aria-hidden="true" className="mt-0.5" size={20} />
              <div>
                <p className="text-label text-white">Short-lived access tokens</p>
                <p className="text-body-sm mt-1 text-white/70">
                  Access tokens remain short-lived and are refreshed through the auth
                  service layer.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <Card className="ambient-panel">
            <p className="text-overline text-[var(--text-brand)]">Secure sign-in</p>
            <h2 className="text-h2 mt-3 text-[var(--text-primary)]">
              Use your work email and password.
            </h2>
            <p className="text-body mt-3 text-[var(--text-secondary)]">
              Successful sign-in creates the session immediately and routes you to the
              correct workspace.
            </p>
            {errorMessage ? (
              <div className="mt-6 rounded-[20px] border border-[color:color-mix(in_srgb,var(--danger-500)_30%,transparent)] bg-[color:color-mix(in_srgb,var(--danger-500)_10%,transparent)] px-4 py-3 text-body-sm text-[var(--text-danger)]">
                {errorMessage}
              </div>
            ) : null}
            <form action={signInAction} className="mt-6 space-y-5">
              <input name="redirectTo" type="hidden" value={redirectTo} />
              <Input
                autoComplete="email"
                id="email"
                label="Work email"
                name="email"
                placeholder="name@ministry.go.ke"
                required
                type="email"
              />
              <Input
                autoComplete="current-password"
                id="password"
                label="Password"
                name="password"
                placeholder="Enter your password"
                required
                type="password"
              />
              <Button className="w-full justify-center" type="submit">
                Sign in
                <ArrowRight aria-hidden="true" size={16} />
              </Button>
            </form>
          </Card>

          <Card title="Development preview accounts">
            <p className="text-body-sm text-[var(--text-secondary)]">
              These seeded accounts are available for local and staging verification.
            </p>
            <div className="mt-5 grid gap-3">
              {authPreviewAccounts.map((account) => (
                <div
                  className="rounded-[20px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4"
                  key={account.email}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-label text-[var(--text-primary)]">{account.name}</p>
                    <p className="text-overline text-[var(--text-brand)]">{account.role}</p>
                  </div>
                  <p className="mt-2 text-body-sm text-[var(--text-secondary)]">
                    {account.department}
                  </p>
                  <div className="mt-4 grid gap-2 text-body-sm text-[var(--text-secondary)] md:grid-cols-2">
                    <p className="md:col-span-2">
                      <span className="text-[var(--text-primary)]">Email:</span>{" "}
                      {account.email}
                    </p>
                    <p>
                      <span className="text-[var(--text-primary)]">Password:</span>{" "}
                      {account.password}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
