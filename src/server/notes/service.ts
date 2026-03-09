import "server-only";

import type { SessionUser } from "@/server/auth/types";
import { prisma } from "@/server/db/prisma";
import { formatDisplayName } from "@/server/scheduling/read-model";

export async function createSessionNote(input: {
  user: SessionUser;
  clientId: string;
  appointmentId?: string;
  content: string;
}) {
  const note = await prisma.sessionNote.create({
    data: {
      counsellorId: input.user.id,
      clientId: input.clientId,
      appointmentId: input.appointmentId,
      content: input.content,
    },
    include: {
      client: { include: { user: true } },
    },
  });

  return {
    id: note.id,
    clientName: formatDisplayName(note.client.user),
    content: note.content,
    isLocked: note.isLocked,
    createdAt: note.createdAt.toISOString(),
  };
}

export async function lockSessionNote(input: {
  user: SessionUser;
  noteId: string;
}) {
  const note = await prisma.sessionNote.updateMany({
    data: {
      isLocked: true,
      lockedAt: new Date(),
    },
    where: {
      id: input.noteId,
      counsellorId: input.user.id,
      isLocked: false,
    },
  });

  return note.count === 1;
}

export async function listSessionNotes(user: SessionUser, limit = 20) {
  const notes = await prisma.sessionNote.findMany({
    where: { counsellorId: user.id },
    include: {
      client: { include: { user: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return notes.map((n) => ({
    id: n.id,
    clientName: formatDisplayName(n.client.user),
    content: n.content,
    isLocked: n.isLocked,
    createdAt: n.createdAt.toISOString(),
  }));
}

export async function listCounsellorClients(counsellorId: string) {
  const appointments = await prisma.appointment.findMany({
    where: { counsellorId },
    select: {
      clientId: true,
      client: { include: { user: true } },
    },
    distinct: ["clientId"],
  });

  return appointments.map((a) => ({
    id: a.clientId,
    name: formatDisplayName(a.client.user),
  }));
}
