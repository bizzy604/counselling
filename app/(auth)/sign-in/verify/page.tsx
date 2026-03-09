"use client";

import { ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const CODE_LENGTH = 6;

export default function MfaVerifyPage() {
  return (
    <Suspense>
      <MfaVerifyForm />
    </Suspense>
  );
}

function MfaVerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "";
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const next = [...code];
    next[index] = value.slice(-1);
    setCode(next);
    if (value && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;
    const next = [...code];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setCode(next);
    const focusIdx = Math.min(pasted.length, CODE_LENGTH - 1);
    inputsRef.current[focusIdx]?.focus();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const otp = code.join("");
    if (otp.length !== CODE_LENGTH) {
      setError("Please enter all 6 digits.");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/v1/auth/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.message ?? "Invalid code. Please try again.");
        setSubmitting(false);
        return;
      }

      router.push((redirectTo || "/") as import("next").Route);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 py-12">
      <Card className="w-full">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--savanna-100)] text-[var(--savanna-700)]">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-h3 text-[var(--text-primary)]">Two-factor verification</h1>
          <p className="text-body text-[var(--text-secondary)]">
            Enter the 6-digit code sent to your registered device.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="flex justify-center gap-2" onPaste={handlePaste}>
            {code.map((digit, i) => (
              <input
                aria-label={`Digit ${i + 1}`}
                autoFocus={i === 0}
                className="input h-12 w-12 text-center font-mono text-lg"
                inputMode="numeric"
                key={i}
                maxLength={1}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                ref={(el) => { inputsRef.current[i] = el; }}
                type="text"
                value={digit}
              />
            ))}
          </div>

          {error && (
            <p className="text-center text-sm text-[var(--text-danger)]" role="alert">
              {error}
            </p>
          )}

          <Button className="w-full" disabled={submitting} type="submit" variant="primary">
            {submitting ? "Verifying…" : "Verify"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--text-tertiary)]">
          Didn't receive a code?{" "}
          <button
            className="text-[var(--text-brand)] underline underline-offset-2 hover:no-underline disabled:opacity-50"
            disabled={resending}
            onClick={async () => {
              setResending(true);
              try {
                await fetch("/v1/auth/mfa/verify", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ resend: true }),
                });
                setResent(true);
                setTimeout(() => setResent(false), 5000);
              } finally {
                setResending(false);
              }
            }}
            type="button"
          >
            {resending ? "Sending…" : resent ? "Code sent!" : "Resend"}
          </button>
        </p>
      </Card>
    </main>
  );
}
