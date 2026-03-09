import type { NextRequest } from "next/server";

import { requireApiSession } from "@/server/auth/api";
import { listNotificationsForUser } from "@/server/notifications/service";
import { ok } from "@/server/v1/response";

export async function GET(request: NextRequest) {
  const auth = await requireApiSession(request, [
    "CLIENT",
    "COUNSELLOR",
    "EMPLOYER",
    "ADMIN",
  ]);

  if (!auth.ok) {
    return auth.response;
  }

  return ok({
    items: await listNotificationsForUser(auth.user),
  });
}
