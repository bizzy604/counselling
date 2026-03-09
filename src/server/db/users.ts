import "server-only";

import type { Role, SessionUser } from "@/server/auth/types";
import { prisma } from "@/server/db/prisma";

function mapSessionUser(user: {
  department: string;
  email: string;
  employerProfile: { organisation: string } | null;
  firstName: string;
  id: string;
  lastName: string;
  phone: string | null;
  role: SessionUser["role"];
}): SessionUser {
  return {
    department: user.department,
    email: user.email,
    employerName: user.employerProfile?.organisation ?? user.department,
    firstName: user.firstName,
    id: user.id,
    lastName: user.lastName,
    phone: user.phone ?? "",
    role: user.role,
  };
}

export async function getSessionUserById(userId: string) {
  const user = await prisma.user.findUnique({
    include: {
      employerProfile: {
        select: {
          organisation: true,
        },
      },
    },
    where: {
      id: userId,
    },
  });

  return user ? mapSessionUser(user) : null;
}

export async function findClientByIdentifier(identifier: string) {
  const normalised = identifier.trim().toLowerCase();
  const user = await prisma.user.findFirst({
    include: {
      employerProfile: {
        select: {
          organisation: true,
        },
      },
    },
    where: {
      role: "CLIENT",
      email: {
        equals: normalised,
        mode: "insensitive",
      },
    },
  });

  return user ? mapSessionUser(user) : null;
}

export async function getUserForPasswordSignIn(email: string) {
  const user = await prisma.user.findFirst({
    include: {
      employerProfile: {
        select: {
          organisation: true,
        },
      },
    },
    where: {
      email: {
        equals: email.trim().toLowerCase(),
        mode: "insensitive",
      },
      isActive: true,
    },
  });

  if (!user) {
    return null;
  }

  return {
    passwordHash: user.passwordHash,
    user: mapSessionUser(user),
  };
}

export async function listUserIdsByRole(role: Role) {
  const users = await prisma.user.findMany({
    select: {
      id: true,
    },
    where: {
      isActive: true,
      role,
    },
  });

  return users.map((user) => user.id);
}
