import "server-only";

import type { UserRole } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { hashPassword } from "@/server/auth/passwords";

export async function listAllUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return users.map((u) => ({
    id: u.id,
    name: `${u.firstName} ${u.lastName}`.trim(),
    email: u.email,
    role: u.role,
    status: u.isActive ? ("active" as const) : ("inactive" as const),
  }));
}

export async function createUser(input: {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  department: string;
  password: string;
}) {
  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email.toLowerCase().trim(),
      role: input.role,
      department: input.department,
      passwordHash,
    },
  });

  // Create role-specific profile
  if (input.role === "CLIENT") {
    await prisma.client.create({ data: { userId: user.id } });
  } else if (input.role === "COUNSELLOR") {
    await prisma.counsellor.create({
      data: { userId: user.id, licenceNumber: `LIC-${user.id.slice(0, 8)}` },
    });
  } else if (input.role === "EMPLOYER") {
    await prisma.employer.create({
      data: { userId: user.id, organisation: input.department, departmentScope: input.department },
    });
  }

  return {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`.trim(),
    email: user.email,
    role: user.role,
    status: "active" as const,
  };
}

export async function updateUser(userId: string, input: {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: UserRole;
  department?: string;
  isActive?: boolean;
}) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.firstName !== undefined && { firstName: input.firstName }),
      ...(input.lastName !== undefined && { lastName: input.lastName }),
      ...(input.email !== undefined && { email: input.email.toLowerCase().trim() }),
      ...(input.role !== undefined && { role: input.role }),
      ...(input.department !== undefined && { department: input.department }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
    },
  });

  return {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`.trim(),
    email: user.email,
    role: user.role,
    status: user.isActive ? ("active" as const) : ("inactive" as const),
  };
}

export async function getAnalyticsSnapshot() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    activeUsers,
    sessionsThisMonth,
    crisisCount,
    counsellors,
  ] = await Promise.all([
    prisma.user.count({
      where: {
        isActive: true,
        lastLoginAt: { gte: thirtyDaysAgo },
      },
    }),
    prisma.appointment.count({
      where: {
        scheduledAt: { gte: thirtyDaysAgo },
        status: { in: ["SCHEDULED", "ATTENDED"] },
      },
    }),
    prisma.crisisEvent.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.counsellor.findMany({
      include: {
        user: true,
        appointments: {
          where: { status: "SCHEDULED" },
        },
      },
    }),
  ]);

  const avgMood = await prisma.moodEntry.aggregate({
    _avg: { value: true },
    where: { createdAt: { gte: thirtyDaysAgo } },
  });

  const counsellorStats = counsellors.map((c) => ({
    id: c.userId,
    name: `${c.user.firstName} ${c.user.lastName}`.trim(),
    currentLoad: c.appointments.length,
    maxCaseload: c.maxCaseload,
    sessionsCompleted: 0, // will be enriched below
    completionRate: 0,
  }));

  // Enrich with completed session counts
  const completedCounts = await prisma.appointment.groupBy({
    by: ["counsellorId"],
    where: { status: "ATTENDED" },
    _count: { id: true },
  });

  const totalCounts = await prisma.appointment.groupBy({
    by: ["counsellorId"],
    _count: { id: true },
  });

  for (const stat of counsellorStats) {
    const completed = completedCounts.find((c) => c.counsellorId === stat.id);
    const total = totalCounts.find((c) => c.counsellorId === stat.id);
    stat.sessionsCompleted = completed?._count.id ?? 0;
    stat.completionRate = total?._count.id
      ? Math.round(((completed?._count.id ?? 0) / total._count.id) * 100)
      : 0;
  }

  return {
    activeUsers,
    sessionsThisMonth,
    avgMood: avgMood._avg.value ? Number(avgMood._avg.value.toFixed(1)) : 0,
    crisisCount,
    counsellors: counsellorStats,
  };
}

export async function getPlatformSettings() {
  const settings = await prisma.platformSetting.findMany();
  const map: Record<string, string> = {};
  for (const s of settings) {
    map[s.key] = s.value;
  }
  return {
    sessionDuration: Number(map["session_duration"] ?? "60"),
    maxCaseload: Number(map["max_caseload"] ?? "20"),
    bookingWindow: Number(map["booking_window"] ?? "14"),
    cancelDeadline: Number(map["cancel_deadline"] ?? "24"),
  };
}

export async function savePlatformSettings(settings: {
  sessionDuration: number;
  maxCaseload: number;
  bookingWindow: number;
  cancelDeadline: number;
}) {
  const pairs = [
    ["session_duration", String(settings.sessionDuration)],
    ["max_caseload", String(settings.maxCaseload)],
    ["booking_window", String(settings.bookingWindow)],
    ["cancel_deadline", String(settings.cancelDeadline)],
  ] as const;

  await prisma.$transaction(
    pairs.map(([key, value]) =>
      prisma.platformSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      }),
    ),
  );
}

export async function getEmployerReportStats(employerId: string) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 90);

  const referrals = await prisma.referral.findMany({
    where: { employerId },
    include: { counsellingRequest: { include: { appointments: true } } },
  });

  const sessionCount = referrals.reduce(
    (acc, r) => acc + (r.counsellingRequest?.appointments.length ?? 0),
    0,
  );

  const clientIds = [...new Set(referrals.map((r) => r.clientId))];

  const avgMood = clientIds.length
    ? await prisma.moodEntry.aggregate({
        _avg: { value: true },
        where: {
          clientId: { in: clientIds },
          createdAt: { gte: thirtyDaysAgo },
        },
      })
    : { _avg: { value: null } };

  const totalEmployees = await prisma.user.count({
    where: {
      role: "CLIENT",
      department: (
        await prisma.employer.findUnique({
          where: { userId: employerId },
          select: { departmentScope: true },
        })
      )?.departmentScope,
    },
  });

  const utilisationRate = totalEmployees > 0
    ? Math.round((clientIds.length / totalEmployees) * 100)
    : 0;

  return {
    utilisationRate,
    sessionCount,
    avgMood: avgMood._avg.value ? Number(avgMood._avg.value.toFixed(1)) : 0,
  };
}

export async function getClientSettings(userId: string) {
  const client = await prisma.client.findUnique({
    where: { userId },
    select: {
      consentMoodSharing: true,
      consentFlags: true,
    },
  });

  const flags = client?.consentFlags && typeof client.consentFlags === "object"
    ? (client.consentFlags as Record<string, boolean>)
    : {};

  return {
    moodSharing: client?.consentMoodSharing ?? false,
    emailNotifications: flags.emailNotifications ?? true,
  };
}

export async function saveClientSettings(userId: string, settings: {
  moodSharing: boolean;
  emailNotifications: boolean;
}) {
  await prisma.client.update({
    where: { userId },
    data: {
      consentMoodSharing: settings.moodSharing,
      consentMoodSharingAt: settings.moodSharing ? new Date() : null,
      consentFlags: { emailNotifications: settings.emailNotifications },
    },
  });
}

export async function getCounsellorSettings(userId: string) {
  const counsellor = await prisma.counsellor.findUnique({
    where: { userId },
    select: {
      bio: true,
      specialisations: true,
      languages: true,
      maxCaseload: true,
    },
  });

  return {
    bio: counsellor?.bio ?? "",
    specialisations: counsellor?.specialisations.join(", ") ?? "",
    languages: counsellor?.languages.join(", ") ?? "",
    maxCaseload: counsellor?.maxCaseload ?? 20,
  };
}

export async function saveCounsellorSettings(userId: string, settings: {
  bio: string;
  specialisations: string;
  languages: string;
  maxCaseload: number;
}) {
  await prisma.counsellor.update({
    where: { userId },
    data: {
      bio: settings.bio,
      specialisations: settings.specialisations.split(",").map((s) => s.trim()).filter(Boolean),
      languages: settings.languages.split(",").map((s) => s.trim()).filter(Boolean),
      maxCaseload: settings.maxCaseload,
    },
  });
}

// ─── Client profile ─────────────────────────────────────────────

export async function getClientProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      clientProfile: {
        select: {
          emergencyContactName: true,
          emergencyContactPhone: true,
          preferredLanguage: true,
        },
      },
    },
  });

  return {
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    emergencyContactName: user?.clientProfile?.emergencyContactName ?? "",
    emergencyContactPhone: user?.clientProfile?.emergencyContactPhone ?? "",
    preferredLanguage: user?.clientProfile?.preferredLanguage ?? "en",
  };
}

export async function saveClientProfile(userId: string, input: {
  firstName: string;
  lastName: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  preferredLanguage: string;
}) {
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone || null,
      },
    }),
    prisma.client.update({
      where: { userId },
      data: {
        emergencyContactName: input.emergencyContactName || null,
        emergencyContactPhone: input.emergencyContactPhone || null,
        preferredLanguage: input.preferredLanguage,
      },
    }),
  ]);
}
