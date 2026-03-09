import "server-only";

import { REFRESH_TOKEN_TTL_SECONDS } from "@/server/auth/constants";
import { getSessionUserById } from "@/server/db/users";
import { prisma } from "@/server/db/prisma";
import type { AuthSession, SessionUser } from "@/server/auth/types";

function mapSession(session: {
  createdAt: Date;
  expiresAt: Date;
  id: string;
  refreshTokenId: string;
  user: SessionUser;
}) {
  return {
    createdAt: session.createdAt.toISOString(),
    expiresAt: session.expiresAt.toISOString(),
    id: session.id,
    refreshTokenId: session.refreshTokenId,
    user: session.user,
  } satisfies AuthSession;
}

export async function createAuthSession(user: SessionUser) {
  const session = await prisma.authSession.create({
    data: {
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000),
      refreshTokenId: crypto.randomUUID(),
      userId: user.id,
    },
  });

  return mapSession({
    ...session,
    user,
  });
}

export async function getAuthSession(sessionId: string) {
  const session = await prisma.authSession.findFirst({
    where: {
      expiresAt: {
        gt: new Date(),
      },
      id: sessionId,
      revokedAt: null,
    },
  });

  if (!session) {
    return null;
  }

  const user = await getSessionUserById(session.userId);

  return user
    ? mapSession({
        ...session,
        user,
      })
    : null;
}

export async function rotateAuthSessionRefreshToken(
  sessionId: string,
  refreshTokenId: string,
) {
  const sessions = await prisma.authSession.updateManyAndReturn({
    data: {
      lastSeenAt: new Date(),
      refreshTokenId: crypto.randomUUID(),
    },
    where: {
      expiresAt: {
        gt: new Date(),
      },
      id: sessionId,
      refreshTokenId,
      revokedAt: null,
    },
  });

  const session = sessions[0];

  if (!session) {
    return null;
  }

  const user = await getSessionUserById(session.userId);

  return user
    ? mapSession({
        ...session,
        user,
      })
    : null;
}

export async function deleteAuthSession(sessionId: string) {
  await prisma.authSession.updateMany({
    data: {
      revokedAt: new Date(),
    },
    where: {
      id: sessionId,
      revokedAt: null,
    },
  });
}
