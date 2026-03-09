import type { NextRequest } from "next/server";

import { requireApiSession } from "@/server/auth/api";
import { getRequestIpAddress } from "@/server/http";
import { cancelAppointment } from "@/server/scheduling/service";
import { failure, ok } from "@/server/v1/response";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiSession(request, ["CLIENT", "ADMIN"]);

  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await params;
  const result = await cancelAppointment({
    actor: auth.user,
    appointmentId: id,
    ipAddress: getRequestIpAddress(request),
  });

  if (!result.ok) {
    return failure(result.code, result.message, result.status);
  }

  return ok({
    item: result.data,
  });
}
