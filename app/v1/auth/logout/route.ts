import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "@/server/auth/constants";
import { logoutInteractiveSession } from "@/server/auth/service";
import { clearAuthCookies } from "@/server/auth/session";

function getIpAddress(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "127.0.0.1";
  }

  return request.headers.get("x-real-ip") ?? "127.0.0.1";
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const accessToken =
    (typeof body?.accessToken === "string" ? body.accessToken : null) ??
    request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken =
    (typeof body?.refreshToken === "string" ? body.refreshToken : null) ??
    request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  await logoutInteractiveSession({
    accessToken,
    ipAddress: getIpAddress(request),
    refreshToken,
  });

  const response = new NextResponse(null, { status: 204 });
  clearAuthCookies(response.cookies);
  return response;
}
