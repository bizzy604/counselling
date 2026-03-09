import type { NextRequest } from "next/server";

import { REFRESH_TOKEN_COOKIE } from "@/server/auth/constants";
import { refreshInteractiveSession } from "@/server/auth/service";
import { setAuthCookies } from "@/server/auth/session";
import { failure, ok } from "@/server/v1/response";

function getIpAddress(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "127.0.0.1";
  }

  return request.headers.get("x-real-ip") ?? "127.0.0.1";
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const refreshToken =
    (typeof body?.refreshToken === "string" ? body.refreshToken : null) ??
    request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!refreshToken) {
    return failure(
      "INVALID_REFRESH",
      "A refresh token is required.",
      401,
    );
  }

  const result = await refreshInteractiveSession({
    ipAddress: getIpAddress(request),
    refreshToken,
  });

  if (!result.ok) {
    return failure(result.code, result.message, result.status);
  }

  const response = ok({
    accessToken: result.data.accessToken,
    refreshToken: result.data.refreshToken,
    user: result.data.user,
  });

  setAuthCookies(response.cookies, {
    accessToken: result.data.accessToken,
    refreshToken: result.data.refreshToken,
  });

  return response;
}
