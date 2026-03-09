import { jwtVerify, SignJWT } from "jose";

import {
  ACCESS_TOKEN_TTL_SECONDS,
  AUTH_AUDIENCE,
  AUTH_ISSUER,
  REFRESH_TOKEN_TTL_SECONDS,
} from "@/server/auth/constants";
import type { RefreshClaims, SessionClaims } from "@/server/auth/types";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "replace-with-a-32-byte-secret-demo-only",
);

async function signToken(
  claims: SessionClaims | RefreshClaims,
  tokenUse: "access" | "refresh",
  ttlSeconds: number,
) {
  const jwt = new SignJWT({
    ...claims,
    tokenUse,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setAudience(AUTH_AUDIENCE)
    .setIssuer(AUTH_ISSUER)
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`);

  return jwt.sign(secret);
}

type RawJwtPayload = {
  refreshTokenId?: unknown;
  role?: unknown;
  sessionId?: unknown;
  sub?: unknown;
  tokenUse?: unknown;
};

async function verifyToken(
  token: string,
  expectedUse: "access" | "refresh",
): Promise<RawJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      audience: AUTH_AUDIENCE,
      issuer: AUTH_ISSUER,
    });

    if (payload.tokenUse !== expectedUse) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function signAccessToken(claims: SessionClaims) {
  return signToken(claims, "access", ACCESS_TOKEN_TTL_SECONDS);
}

export async function signRefreshToken(claims: RefreshClaims) {
  return signToken(claims, "refresh", REFRESH_TOKEN_TTL_SECONDS);
}

export async function verifyAccessToken(token: string): Promise<SessionClaims | null> {
  const payload = await verifyToken(token, "access");

  if (
    typeof payload?.sessionId !== "string" ||
    typeof payload.role !== "string" ||
    typeof payload.sub !== "string"
  ) {
    return null;
  }

  return {
    sessionId: payload.sessionId,
    role: payload.role as SessionClaims["role"],
    sub: payload.sub,
  };
}

export async function verifyRefreshToken(token: string): Promise<RefreshClaims | null> {
  const payload = await verifyToken(token, "refresh");

  if (
    typeof payload?.refreshTokenId !== "string" ||
    typeof payload.sessionId !== "string" ||
    typeof payload.role !== "string" ||
    typeof payload.sub !== "string"
  ) {
    return null;
  }

  return {
    refreshTokenId: payload.refreshTokenId,
    sessionId: payload.sessionId,
    role: payload.role as RefreshClaims["role"],
    sub: payload.sub,
  };
}
