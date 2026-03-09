import type { NextRequest } from "next/server";

import { requireApiSession } from "@/server/auth/api";
import { getRequestIpAddress } from "@/server/http";
import { rejectCounsellingRequest } from "@/server/scheduling/service";
import { failure, ok } from "@/server/v1/response";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiSession(request, ["ADMIN"]);

  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);

  if (!body || typeof body.reason !== "string") {
    return failure("INVALID_REQUEST", "Provide a rejection reason.", 400);
  }

  const result = await rejectCounsellingRequest({
    actor: auth.user,
    ipAddress: getRequestIpAddress(request),
    reason: body.reason,
    requestId: id,
  });

  if (!result.ok) {
    return failure(result.code, result.message, result.status);
  }

  return ok({
    item: result.data,
  });
}
