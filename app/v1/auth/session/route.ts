import type { NextRequest } from "next/server";

import { getRequestSession } from "@/server/auth/session";
import { ok } from "@/server/v1/response";

export async function GET(request: NextRequest) {
  const session = await getRequestSession(request);

  return ok({
    authenticated: Boolean(session),
    session: session
      ? {
          expiresAt: session.expiresAt,
          id: session.id,
          user: session.user,
        }
      : null,
    user: session?.user ?? null,
  });
}
