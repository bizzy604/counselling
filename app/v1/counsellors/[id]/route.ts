import type { NextRequest } from "next/server";

import { requireApiSession } from "@/server/auth/api";
import { listCounsellors } from "@/server/scheduling/service";
import { failure, ok } from "@/server/v1/response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiSession(request, ["CLIENT", "COUNSELLOR", "ADMIN"]);

  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await params;
  const counsellor = (await listCounsellors()).find((item) => item.id === id);

  if (!counsellor) {
    return failure("NOT_FOUND", "Counsellor not found.", 404);
  }

  return ok({
    item: counsellor,
  });
}
