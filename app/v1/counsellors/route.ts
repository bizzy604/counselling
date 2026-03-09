import type { NextRequest } from "next/server";

import { requireApiSession } from "@/server/auth/api";
import { listCounsellors } from "@/server/scheduling/service";
import { ok } from "@/server/v1/response";

export async function GET(request: NextRequest) {
  const auth = await requireApiSession(request, ["CLIENT", "COUNSELLOR", "ADMIN"]);

  if (!auth.ok) {
    return auth.response;
  }

  return ok({
    items: await listCounsellors(),
  });
}
