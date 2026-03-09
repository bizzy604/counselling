import type { NextRequest } from "next/server";

import { requireApiSession } from "@/server/auth/api";
import { getRequestIpAddress } from "@/server/http";
import {
  createCounsellingRequest,
  listRequestsForUser,
} from "@/server/scheduling/service";
import {
  requestSources,
  serviceTypes,
  urgencyLevels,
} from "@/server/scheduling/types";
import { failure, ok } from "@/server/v1/response";

export async function GET(request: NextRequest) {
  const auth = await requireApiSession(request, ["CLIENT", "ADMIN"]);

  if (!auth.ok) {
    return auth.response;
  }

  return ok({
    items: await listRequestsForUser(auth.user),
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
    !serviceTypes.includes(body.serviceType) ||
    !requestSources.includes(body.source) ||
    !urgencyLevels.includes(body.urgency)
  ) {
    return failure(
      "INVALID_REQUEST",
      "Provide serviceType, source, and urgency using supported values.",
      400,
    );
  }

  const result = await createCounsellingRequest({
    actor: auth.user,
    ipAddress: getRequestIpAddress(request),
    notes: typeof body.notes === "string" ? body.notes : undefined,
    preferredCounsellorId:
      typeof body.preferredCounsellorId === "string"
        ? body.preferredCounsellorId
        : undefined,
    serviceType: body.serviceType,
    source: body.source,
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
