import type { NextRequest } from "next/server";

import { requireApiSession } from "@/server/auth/api";
import { getCounsellorAvailability } from "@/server/scheduling/service";
import { ok } from "@/server/v1/response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiSession(request, ["CLIENT", "COUNSELLOR", "ADMIN"]);

  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await params;

  return ok({
    items: await getCounsellorAvailability(id, 30),
  });
}
