import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_TTL_SECONDS,
  COOKIE_BASE_OPTIONS,
} from "@/server/auth/constants";
import { signAccessToken, verifyAccessToken } from "@/server/auth/jwt";

const protectedRoutes = {
  "/client": "CLIENT",
  "/counsellor": "COUNSELLOR",
  "/employer": "EMPLOYER",
  "/admin": "ADMIN",
} as const;

function isAuthPage(pathname: string) {
  return pathname === "/sign-in" || pathname.startsWith("/sign-in/");
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const claims = accessToken ? await verifyAccessToken(accessToken) : null;

  for (const [prefix, expectedRole] of Object.entries(protectedRoutes)) {
    if (!pathname.startsWith(prefix)) {
      continue;
    }

    if (!claims) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(signInUrl);
    }

    if (claims.role !== expectedRole) {
      return NextResponse.redirect(new URL("/forbidden", request.url));
    }
  }

  const response = NextResponse.next();

  if (claims && !isAuthPage(pathname)) {
    const renewedAccessToken = await signAccessToken(claims);

    response.cookies.set(ACCESS_TOKEN_COOKIE, renewedAccessToken, {
      ...COOKIE_BASE_OPTIONS,
      maxAge: ACCESS_TOKEN_TTL_SECONDS,
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
