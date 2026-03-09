import "server-only";

import { recordAuditEvent } from "@/server/auth/audit";
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from "@/server/auth/jwt";
import { verifyPassword } from "@/server/auth/passwords";
import { createAuthSession, deleteAuthSession, getAuthSession, rotateAuthSessionRefreshToken } from "@/server/auth/store";
import { prisma } from "@/server/db/prisma";
import { getUserForPasswordSignIn } from "@/server/db/users";

export function normaliseRedirectPath(redirectTo?: string | null) {
  if (!redirectTo || !redirectTo.startsWith("/") || redirectTo.startsWith("//")) {
    return null;
  }

  if (redirectTo.startsWith("/sign-in")) {
    return null;
  }

  return redirectTo;
}

export async function signInWithPassword(input: {
  email: string;
  ipAddress: string;
  password: string;
  redirectTo?: string | null;
}) {
  const record = await getUserForPasswordSignIn(input.email);
  const passwordMatches = record
    ? await verifyPassword(input.password, record.passwordHash)
    : false;

  if (!record || !passwordMatches) {
    recordAuditEvent({
      eventType: "auth.login.failed",
      ipAddress: input.ipAddress,
      metadata: {
        email: input.email.trim().toLowerCase(),
      },
      outcome: "FAILURE",
    });

    return {
      code: "INVALID_CREDENTIALS",
      message: "The email or password is incorrect.",
      ok: false as const,
      status: 401,
    };
  }

  await prisma.user.update({
    data: {
      lastLoginAt: new Date(),
    },
    where: {
      id: record.user.id,
    },
  });

  const session = await createAuthSession(record.user);
  const accessToken = await signAccessToken({
    role: session.user.role,
    sessionId: session.id,
    sub: session.user.id,
  });
  const refreshToken = await signRefreshToken({
    refreshTokenId: session.refreshTokenId,
    role: session.user.role,
    sessionId: session.id,
    sub: session.user.id,
  });

  recordAuditEvent({
    actorId: session.user.id,
    actorRole: session.user.role,
    eventType: "auth.login.succeeded",
    ipAddress: input.ipAddress,
    metadata: {
      sessionId: session.id,
    },
    outcome: "SUCCESS",
  });

  return {
    data: {
      accessToken,
      refreshToken,
      redirectTo: normaliseRedirectPath(input.redirectTo) ?? `/${session.user.role.toLowerCase()}`,
      session,
      user: session.user,
    },
    ok: true as const,
  };
}

export async function refreshInteractiveSession(input: {
  ipAddress: string;
  refreshToken: string;
}) {
  const claims = await verifyRefreshToken(input.refreshToken);

  if (!claims) {
    return {
      code: "INVALID_REFRESH",
      message: "The refresh token is invalid or expired.",
      ok: false as const,
      status: 401,
    };
  }

  const session = await rotateAuthSessionRefreshToken(
    claims.sessionId,
    claims.refreshTokenId,
  );

  if (!session || session.user.id !== claims.sub) {
    return {
      code: "INVALID_REFRESH",
      message: "The refresh token could not be rotated.",
      ok: false as const,
      status: 401,
    };
  }

  const accessToken = await signAccessToken({
    role: session.user.role,
    sessionId: session.id,
    sub: session.user.id,
  });
  const refreshToken = await signRefreshToken({
    refreshTokenId: session.refreshTokenId,
    role: session.user.role,
    sessionId: session.id,
    sub: session.user.id,
  });

  recordAuditEvent({
    actorId: session.user.id,
    actorRole: session.user.role,
    eventType: "auth.session.refreshed",
    ipAddress: input.ipAddress,
    metadata: {
      sessionId: session.id,
    },
    outcome: "SUCCESS",
  });

  return {
    data: {
      accessToken,
      refreshToken,
      session,
      user: session.user,
    },
    ok: true as const,
  };
}

export async function logoutInteractiveSession(input: {
  accessToken?: string | null;
  ipAddress: string;
  refreshToken?: string | null;
}) {
  const accessClaims = input.accessToken
    ? await verifyAccessToken(input.accessToken)
    : null;
  const refreshClaims = input.refreshToken
    ? await verifyRefreshToken(input.refreshToken)
    : null;
  const sessionId = accessClaims?.sessionId ?? refreshClaims?.sessionId;

  if (!sessionId) {
    return;
  }

  const session = await getAuthSession(sessionId);

  if (session) {
    await deleteAuthSession(sessionId);
    recordAuditEvent({
      actorId: session.user.id,
      actorRole: session.user.role,
      eventType: "auth.logout",
      ipAddress: input.ipAddress,
      metadata: {
        sessionId,
      },
      outcome: "SUCCESS",
    });
  }
}
