import type { NextRequest } from "next/server";

import { failure } from "@/server/v1/response";
import { getRequestSession } from "@/server/auth/session";
import type { Role } from "@/server/auth/types";

export async function requireApiSession(
  request: NextRequest | Request,
  allowedRoles?: Role[],
) {
  const session = await getRequestSession(request);

  if (!session) {
    return {
      ok: false as const,
      response: failure(
        "UNAUTHORISED",
        "A valid authenticated session is required.",
        401,
      ),
    };
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    return {
      ok: false as const,
      response: failure(
        "FORBIDDEN",
        "Your role does not allow access to this resource.",
        403,
      ),
    };
  }

  return {
    ok: true as const,
    session,
    user: session.user,
  };
}
