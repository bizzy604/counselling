import type { NextRequest } from "next/server";

import { requireApiSession } from "@/server/auth/api";
import { getRequestIpAddress } from "@/server/http";
import { rejectReferral } from "@/server/referrals/service";
import { failure, ok } from "@/server/v1/response";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiSession(request, ["ADMIN"]);

  if (!auth.ok) {
    return auth.response;
  }

  const body = await request.json().catch(() => null);
  const { id } = await params;

  if (!body || typeof body.reason !== "string") {
    return failure("INVALID_REQUEST", "Provide a rejection reason.", 400);
  }

  const result = await rejectReferral({
    actor: auth.user,
    ipAddress: getRequestIpAddress(request),
    reason: body.reason,
    referralId: id,
  });

  if (!result.ok) {
    return failure(result.code, result.message, result.status);
  }

  return ok({
    item: result.data,
  });
}
