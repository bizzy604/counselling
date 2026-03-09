import type { NextRequest } from "next/server";

import { requireApiSession } from "@/server/auth/api";
import { getRequestIpAddress } from "@/server/http";
import { upsertCounsellorAvailability } from "@/server/scheduling/service";
import { failure, ok } from "@/server/v1/response";

export async function PUT(request: NextRequest) {
  const auth = await requireApiSession(request, ["COUNSELLOR"]);

  if (!auth.ok) {
    return auth.response;
  }

  const body = await request.json().catch(() => null);

  if (!body || !Array.isArray(body.rules)) {
    return failure("INVALID_REQUEST", "Provide a rules array.", 400);
  }

  const rules = body.rules.filter((rule: unknown): rule is Record<string, unknown> => {
    return typeof rule === "object" && rule !== null;
  });

  const parsedRules = rules.map((rule: Record<string, unknown>, index: number) => ({
    dayOfWeek:
      typeof rule.dayOfWeek === "number"
        ? rule.dayOfWeek
        : index + 1,
    endTime: typeof rule.endTime === "string" ? rule.endTime : "",
    startTime: typeof rule.startTime === "string" ? rule.startTime : "",
  }));

  const result = await upsertCounsellorAvailability({
    actor: auth.user,
    ipAddress: getRequestIpAddress(request),
    rules: parsedRules,
  });

  if (!result.ok) {
    return failure(result.code, result.message, result.status);
  }

  return ok({
    items: result.data,
  });
}
