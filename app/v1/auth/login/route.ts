import type { NextRequest } from "next/server";

import { signInWithPassword } from "@/server/auth/service";
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

  if (!body || typeof body.email !== "string" || typeof body.password !== "string") {
    return failure(
      "INVALID_REQUEST",
      "Provide email and password.",
      400,
    );
  }

  const result = await signInWithPassword({
    email: body.email,
    ipAddress: getIpAddress(request),
    password: body.password,
    redirectTo: typeof body.redirectTo === "string" ? body.redirectTo : undefined,
  });

  if (!result.ok) {
    return failure(result.code, result.message, result.status);
  }

  const response = ok({
    accessToken: result.data.accessToken,
    refreshToken: result.data.refreshToken,
    redirectTo: result.data.redirectTo,
    user: result.data.user,
  });

  setAuthCookies(response.cookies, {
    accessToken: result.data.accessToken,
    refreshToken: result.data.refreshToken,
  });

  return response;
}
