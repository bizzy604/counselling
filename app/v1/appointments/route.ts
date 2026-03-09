import type { NextRequest } from "next/server";

import { requireApiSession } from "@/server/auth/api";
import { getRequestIpAddress } from "@/server/http";
import {
  createAppointment,
  listAppointmentsForUser,
} from "@/server/scheduling/service";
import { serviceTypes } from "@/server/scheduling/types";
import { failure, ok } from "@/server/v1/response";

export async function GET(request: NextRequest) {
  const auth = await requireApiSession(request, ["CLIENT", "COUNSELLOR", "ADMIN"]);

  if (!auth.ok) {
    return auth.response;
  }

  return ok({
    items: await listAppointmentsForUser(auth.user),
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiSession(request, ["CLIENT"]);

  if (!auth.ok) {
    return auth.response;
  }

  const body = await request.json().catch(() => null);

  if (
    !body ||
    typeof body.counsellorId !== "string" ||
    typeof body.scheduledAt !== "string" ||
    !serviceTypes.includes(body.serviceType)
  ) {
    return failure(
      "INVALID_REQUEST",
      "Provide counsellorId, scheduledAt, and a valid serviceType.",
      400,
    );
  }

  const result = await createAppointment({
    actor: auth.user,
    counsellorId: body.counsellorId,
    ipAddress: getRequestIpAddress(request),
    scheduledAt: body.scheduledAt,
    serviceType: body.serviceType,
  });

  if (!result.ok) {
    return failure(result.code, result.message, result.status);
  }

  return ok(
    {
      item: result.data,
    },
    { status: 201 },
  );
}
