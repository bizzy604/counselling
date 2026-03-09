import "server-only";

import type { Route } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { roleToSlug } from "@/lib/demo-data";
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_TTL_SECONDS,
  COOKIE_BASE_OPTIONS,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_TTL_SECONDS,
} from "@/server/auth/constants";
import { verifyAccessToken } from "@/server/auth/jwt";
import { getAuthSession } from "@/server/auth/store";
import type { AuthSession, Role, RoleSlug } from "@/server/auth/types";

type CookieAdapter = {
  delete(name: string): void;
  set(name: string, value: string, options: Record<string, unknown>): void;
};

function parseCookieHeader(cookieHeader: string | null) {
  if (!cookieHeader) {
    return new Map<string, string>();
  }

  return new Map(
    cookieHeader
      .split(";")
      .map((cookie) => cookie.trim())
      .filter(Boolean)
      .map((cookie) => {
        const separatorIndex = cookie.indexOf("=");

        if (separatorIndex === -1) {
          return [cookie, ""] as const;
        }

        return [
          cookie.slice(0, separatorIndex),
          decodeURIComponent(cookie.slice(separatorIndex + 1)),
        ] as const;
      }),
  );
}

function extractBearerToken(authorizationHeader: string | null) {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    return null;
  }

  return authorizationHeader.slice("Bearer ".length).trim();
}

async function resolveSessionFromAccessToken(accessToken?: string | null) {
  if (!accessToken) {
    return null;
  }

  const claims = await verifyAccessToken(accessToken);

  if (!claims) {
    return null;
  }

  const session = await getAuthSession(claims.sessionId);

  if (
    !session ||
    session.user.id !== claims.sub ||
    session.user.role !== claims.role
  ) {
    return null;
  }

  return session;
}

export function homePathForRole(role: Role): `/${RoleSlug}` {
  return `/${roleToSlug[role]}`;
}

export function setAuthCookies(
  cookieStore: CookieAdapter,
  tokens: {
    accessToken: string;
    refreshToken: string;
  },
) {
  cookieStore.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    ...COOKIE_BASE_OPTIONS,
    maxAge: ACCESS_TOKEN_TTL_SECONDS,
  });
  cookieStore.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    ...COOKIE_BASE_OPTIONS,
    maxAge: REFRESH_TOKEN_TTL_SECONDS,
  });
}

export function clearAuthCookies(cookieStore: CookieAdapter) {
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
}

export async function getSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  return resolveSessionFromAccessToken(
    cookieStore.get(ACCESS_TOKEN_COOKIE)?.value,
  );
}

export async function getSessionUser() {
  const session = await getSession();
  return session?.user ?? null;
}

export async function requireRole(expectedRole: Role) {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in" as Route);
  }

  if (session.user.role !== expectedRole) {
    redirect("/forbidden" as Route);
  }

  return session.user;
}

export async function getRequestSession(request: Request) {
  const bearerToken = extractBearerToken(request.headers.get("authorization"));
  const cookieToken = parseCookieHeader(request.headers.get("cookie")).get(
    ACCESS_TOKEN_COOKIE,
  );

  return resolveSessionFromAccessToken(bearerToken ?? cookieToken ?? null);
}
