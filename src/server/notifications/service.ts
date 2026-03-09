import "server-only";

import type { Prisma } from "@prisma/client";

import type { SessionUser } from "@/server/auth/types";
import { prisma } from "@/server/db/prisma";

function mapNotification(notification: {
  channel: "EMAIL" | "SMS" | "IN_APP";
  createdAt: Date;
  id: string;
  payload: unknown;
  readAt: Date | null;
  status: "PENDING" | "SENT" | "FAILED" | "READ";
  type: string;
}) {
  return {
    channel: notification.channel,
    createdAt: notification.createdAt.toISOString(),
    id: notification.id,
    payload:
      notification.payload && typeof notification.payload === "object"
        ? (notification.payload as Record<string, unknown>)
        : {},
    readAt: notification.readAt?.toISOString() ?? null,
    status: notification.status,
    type: notification.type,
  };
}

export async function createInAppNotification(input: {
  payload: Record<string, unknown>;
  type: string;
  userId: string;
}) {
  const notification = await prisma.notification.create({
    data: {
      channel: "IN_APP",
      payload: input.payload as Prisma.InputJsonValue,
      sentAt: new Date(),
      status: "SENT",
      type: input.type,
      userId: input.userId,
    },
  });

  return mapNotification(notification);
}

export async function listNotificationsForUser(user: SessionUser, limit = 12) {
  const notifications = await prisma.notification.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    where: {
      userId: user.id,
    },
  });

  return notifications.map(mapNotification);
}

export async function markNotificationRead(input: {
  notificationId: string;
  user: SessionUser;
}) {
  const notification = await prisma.notification.updateManyAndReturn({
    data: {
      readAt: new Date(),
      status: "READ",
    },
    where: {
      id: input.notificationId,
      userId: input.user.id,
    },
  });

  return notification[0] ? mapNotification(notification[0]) : null;
}
