import "server-only";

import type { ContentStatus } from "@prisma/client";
import type { SessionUser } from "@/server/auth/types";
import { prisma } from "@/server/db/prisma";

export async function createContent(input: {
  title: string;
  body?: string;
  category: string;
  status: ContentStatus;
  authorId?: string;
}) {
  const item = await prisma.content.create({ data: input });
  return {
    id: item.id,
    title: item.title,
    category: item.category,
    status: item.status.toLowerCase() as "published" | "draft" | "archived",
    updatedAt: item.updatedAt.toISOString().slice(0, 10),
  };
}

export async function updateContent(contentId: string, input: {
  title?: string;
  body?: string;
  category?: string;
  status?: ContentStatus;
}) {
  const item = await prisma.content.update({
    where: { id: contentId },
    data: input,
  });
  return {
    id: item.id,
    title: item.title,
    category: item.category,
    status: item.status.toLowerCase() as "published" | "draft" | "archived",
    updatedAt: item.updatedAt.toISOString().slice(0, 10),
  };
}

export async function assignContentToClient(input: {
  contentId: string;
  clientId: string;
  assignedBy: string;
}) {
  return prisma.contentAssignment.upsert({
    where: {
      contentId_clientId: {
        contentId: input.contentId,
        clientId: input.clientId,
      },
    },
    update: {},
    create: {
      contentId: input.contentId,
      clientId: input.clientId,
      assignedBy: input.assignedBy,
    },
  });
}

export async function listPublishedContent() {
  const items = await prisma.content.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
  });

  return items.map((c) => ({
    id: c.id,
    title: c.title,
    category: c.category,
    emoji: c.emoji,
    duration: c.duration,
    status: c.status,
    updatedAt: c.updatedAt.toISOString().slice(0, 10),
  }));
}

export async function listAllContent() {
  const items = await prisma.content.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return items.map((c) => ({
    id: c.id,
    title: c.title,
    category: c.category,
    status: c.status.toLowerCase() as "published" | "draft" | "archived",
    updatedAt: c.updatedAt.toISOString().slice(0, 10),
  }));
}

export async function listContentCategories() {
  const items = await prisma.content.groupBy({
    by: ["category"],
    where: { status: "PUBLISHED" },
    _count: { id: true },
  });

  return items.map((g) => ({
    label: g.category,
    count: g._count.id,
  }));
}

export async function listClientEnrollments(user: SessionUser) {
  const enrollments = await prisma.programmeEnrollment.findMany({
    where: { clientId: user.id },
    include: { programme: true },
    orderBy: { createdAt: "desc" },
  });

  return enrollments.map((e) => ({
    id: e.id,
    title: e.programme.title,
    modules: e.programme.moduleCount,
    completed: e.completedModules,
    status: e.status === "ACTIVE" ? ("active" as const) : ("inactive" as const),
  }));
}
