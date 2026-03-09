import { NextRequest } from "next/server";

import { getRequestSession } from "@/server/auth/session";
import { ok, failure } from "@/server/v1/response";

export async function POST(request: NextRequest) {
  const session = await getRequestSession(request);
  if (!session) {
    return failure("UNAUTHORIZED", "Authentication required", 401);
  }

  const body = await request.json().catch(() => null);
  const otp = typeof body?.otp === "string" ? body.otp : "";

  if (!otp || otp.length !== 6) {
    return failure("BAD_REQUEST", "A 6-digit code is required", 400);
  }

  // MFA verification logic placeholder — in production this would validate
  // the TOTP/SMS code against the user's stored secret or pending code.
  // For now, accept any valid-format code to unblock the flow.
  return ok({ verified: true });
}
