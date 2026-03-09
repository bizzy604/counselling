import type { NextRequest } from "next/server";

import { requireApiSession } from "@/server/auth/api";
import { getRequestIpAddress } from "@/server/http";
import { createReferral, listReferralsForUser } from "@/server/referrals/service";
import { serviceTypes, urgencyLevels } from "@/server/scheduling/types";
import { failure, ok } from "@/server/v1/response";

export async function GET(request: NextRequest) {
  const auth = await requireApiSession(request, ["EMPLOYER", "ADMIN"]);

  if (!auth.ok) {
    return auth.response;
  }

  return ok({
    items: await listReferralsForUser(auth.user),
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiSession(request, ["EMPLOYER"]);

  if (!auth.ok) {
    return auth.response;
  }

  const body = await request.json().catch(() => null);

  if (
    !body ||
    typeof body.employeeIdentifier !== "string" ||
    !serviceTypes.includes(body.serviceType) ||
    !urgencyLevels.includes(body.urgency)
  ) {
    return failure(
      "INVALID_REQUEST",
      "Provide employeeIdentifier, serviceType, and urgency using supported values.",
      400,
    );
  }

  const result = await createReferral({
    actor: auth.user,
    employeeIdentifier: body.employeeIdentifier,
    ipAddress: getRequestIpAddress(request),
    notes: typeof body.notes === "string" ? body.notes : undefined,
    serviceType: body.serviceType,
    urgency: body.urgency,
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
