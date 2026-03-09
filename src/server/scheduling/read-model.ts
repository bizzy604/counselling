import "server-only";

import { Prisma } from "@prisma/client";

import type { SessionUser } from "@/server/auth/types";
import { prisma } from "@/server/db/prisma";
import type {
  Appointment,
  AvailabilityRule,
  AvailabilitySlot,
  CounsellingRequest,
  RequestSource,
  ServiceType,
} from "@/server/scheduling/types";

const WEEKDAY_TEMPLATES = [1, 2, 3, 4, 5] as const;

type AppointmentRecord = Prisma.AppointmentGetPayload<{
  include: {
    client: { include: { user: true } };
    counsellor: { include: { user: true } };
  };
}>;

type RequestRecord = Prisma.CounsellingRequestGetPayload<{
  include: {
    appointments: { select: { id: true }; take: 1 };
    assignedCounsellor: { include: { user: true } };
    client: { include: { user: true } };
    preferredCounsellor: { include: { user: true } };
    referral: { select: { employerId: true; id: true } };
  };
}>;

type CounsellorAvailabilityRecord = Prisma.CounsellorGetPayload<{
  include: {
    appointments: { select: { scheduledAt: true } };
    availabilityRules: true;
    leavePeriods: true;
    user: true;
  };
}>;

type CounsellorProfileRecord = Prisma.CounsellorGetPayload<{
  include: {
    user: true;
  };
}>;

function compareIso(left: string, right: string) {
  return new Date(left).getTime() - new Date(right).getTime();
}

function parseTimeParts(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return { hours, minutes };
}

function mergeDateWithTime(date: Date, time: string) {
  const merged = new Date(date);
  const { hours, minutes } = parseTimeParts(time);
  merged.setHours(hours, minutes, 0, 0);
  return merged;
}

function addMinutes(date: Date, minutes: number) {
  const next = new Date(date);
  next.setMinutes(next.getMinutes() + minutes);
  return next;
}

export function formatDisplayName(user: { firstName: string; lastName: string }) {
  return `${user.firstName} ${user.lastName}`.trim();
}

export function formatTimeValue(value: Date) {
  return value.toISOString().slice(11, 16);
}

export function createTimeValue(time: string) {
  return new Date(`1970-01-01T${time}:00.000Z`);
}

export function normaliseScheduledAt(value: string) {
  const scheduledAt = new Date(value);
  return Number.isNaN(scheduledAt.getTime()) ? null : scheduledAt;
}

export function isSlotConflictError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

export function formatServiceTypeLabel(serviceType: ServiceType) {
  return serviceType
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatRequestSourceLabel(source: RequestSource) {
  return source
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function mapAppointment(record: AppointmentRecord): Appointment {
  return {
    clientId: record.clientId,
    clientName: formatDisplayName(record.client.user),
    counsellorId: record.counsellorId,
    counsellorName: formatDisplayName(record.counsellor.user),
    id: record.id,
    modality: record.modality === "IN_PERSON" ? "IN_PERSON" : "VIDEO",
    scheduledAt: record.scheduledAt.toISOString(),
    serviceType: record.serviceType,
    source: record.counsellingRequestId ? "REQUEST_ASSIGNMENT" : "DIRECT_BOOKING",
    status: record.status,
  };
}

export function mapRequest(record: RequestRecord): CounsellingRequest {
  return {
    assignedAppointmentId: record.appointments[0]?.id,
    assignedCounsellorId: record.assignedCounsellorId ?? undefined,
    assignedCounsellorName: record.assignedCounsellor
      ? formatDisplayName(record.assignedCounsellor.user)
      : undefined,
    clientId: record.clientId,
    clientName: formatDisplayName(record.client.user),
    id: record.id,
    notes: record.notes ?? undefined,
    preferredCounsellorId: record.preferredCounsellorId ?? undefined,
    preferredCounsellorName: record.preferredCounsellor
      ? formatDisplayName(record.preferredCounsellor.user)
      : undefined,
    reason: record.adminReason ?? undefined,
    requestedAt: record.createdAt.toISOString(),
    serviceType: record.serviceType,
    source: record.source,
    status: record.status,
    urgency: record.urgency,
  };
}

function mapAvailabilityRule(
  counsellorId: string,
  dayOfWeek: number,
  rule?: {
    endTime: Date;
    id: string;
    isActive: boolean;
    startTime: Date;
  },
): AvailabilityRule {
  return {
    counsellorId,
    dayOfWeek,
    endTime: rule ? formatTimeValue(rule.endTime) : "",
    id: rule?.id ?? `${counsellorId}-${dayOfWeek}`,
    isActive: rule?.isActive ?? false,
    startTime: rule ? formatTimeValue(rule.startTime) : "",
  };
}

function buildAvailabilitySlots(counsellor: CounsellorAvailabilityRecord, days: number) {
  const bookedSlots = new Set(
    counsellor.appointments.map((appointment) => appointment.scheduledAt.toISOString()),
  );
  const slots: AvailabilitySlot[] = [];

  for (let offset = 0; offset < days; offset += 1) {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    date.setHours(0, 0, 0, 0);

    const current = date.toISOString().slice(0, 10);
    const dayRules = counsellor.availabilityRules.filter(
      (rule) => rule.dayOfWeek === date.getDay() && rule.isActive,
    );
    const blockedByLeave = counsellor.leavePeriods.some((leavePeriod) => {
      const startsOn = leavePeriod.startsOn.toISOString().slice(0, 10);
      const endsOn = leavePeriod.endsOn.toISOString().slice(0, 10);
      return current >= startsOn && current <= endsOn;
    });

    if (!dayRules.length || blockedByLeave) {
      continue;
    }

    for (const rule of dayRules) {
      let cursor = mergeDateWithTime(date, formatTimeValue(rule.startTime));
      const end = mergeDateWithTime(date, formatTimeValue(rule.endTime));

      while (cursor < end) {
        const startsAt = cursor.toISOString();

        if (!bookedSlots.has(startsAt) && cursor > new Date()) {
          slots.push({
            counsellorId: counsellor.userId,
            counsellorName: formatDisplayName(counsellor.user),
            endsAt: addMinutes(cursor, 60).toISOString(),
            startsAt,
          });
        }

        cursor = addMinutes(cursor, 60);
      }
    }
  }

  return slots.sort((left, right) => compareIso(left.startsAt, right.startsAt));
}

export async function getAppointmentRecordById(appointmentId: string) {
  return prisma.appointment.findUnique({
    include: {
      client: { include: { user: true } },
      counsellor: { include: { user: true } },
    },
    where: { id: appointmentId },
  });
}

export async function getRequestRecordById(requestId: string) {
  return prisma.counsellingRequest.findUnique({
    include: {
      appointments: { select: { id: true }, take: 1 },
      assignedCounsellor: { include: { user: true } },
      client: { include: { user: true } },
      preferredCounsellor: { include: { user: true } },
      referral: { select: { employerId: true, id: true } },
    },
    where: { id: requestId },
  });
}

export async function getCounsellorProfile(counsellorId: string) {
  const [counsellor, activeCaseload] = await Promise.all([
    prisma.counsellor.findUnique({
      include: { user: true },
      where: { userId: counsellorId },
    }),
    prisma.appointment.count({
      where: { counsellorId, status: "SCHEDULED" },
    }),
  ]);

  if (!counsellor) {
    return null;
  }

  return {
    activeCaseload,
    bio: counsellor.bio ?? "",
    employerName: counsellor.user.department,
    id: counsellor.userId,
    languages: [] as string[],
    maxCaseload: counsellor.maxCaseload,
    specialisations: counsellor.specialisations,
    title: formatDisplayName(counsellor.user),
  };
}

export async function listCounsellors() {
  const counsellors = await prisma.counsellor.findMany({
    include: { user: true },
  });

  const mapped = await Promise.all(
    counsellors.map(async (counsellor: CounsellorProfileRecord) => {
      const [availability, activeCaseload] = await Promise.all([
        getCounsellorAvailability(counsellor.userId, 14),
        prisma.appointment.count({
          where: { counsellorId: counsellor.userId, status: "SCHEDULED" },
        }),
      ]);

      return {
        activeCaseload,
        bio: counsellor.bio ?? "",
        employerName: counsellor.user.department,
        id: counsellor.userId,
        languages: [] as string[],
        maxCaseload: counsellor.maxCaseload,
        openSlots: availability.length,
        specialisations: counsellor.specialisations,
        title: formatDisplayName(counsellor.user),
      };
    }),
  );

  return mapped.sort((left, right) => left.title.localeCompare(right.title));
}

export async function getCounsellorAvailability(counsellorId: string, days = 14) {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);

  const counsellor = await prisma.counsellor.findUnique({
    include: {
      appointments: {
        select: { scheduledAt: true },
        where: {
          scheduledAt: { gte: new Date(), lt: endDate },
          status: "SCHEDULED",
        },
      },
      availabilityRules: {
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      },
      leavePeriods: true,
      user: true,
    },
    where: { userId: counsellorId },
  });

  return counsellor ? buildAvailabilitySlots(counsellor, days) : [];
}

export async function getAvailabilityTemplates(counsellorId: string) {
  const rules = await prisma.counsellorAvailabilityRule.findMany({
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    where: { counsellorId },
  });

  return WEEKDAY_TEMPLATES.map((dayOfWeek) =>
    mapAvailabilityRule(
      counsellorId,
      dayOfWeek,
      rules.find((rule) => rule.dayOfWeek === dayOfWeek),
    ),
  );
}

export async function listAppointmentsForUser(user: SessionUser) {
  if (user.role === "EMPLOYER") {
    return [];
  }

  const appointments = await prisma.appointment.findMany({
    include: {
      client: { include: { user: true } },
      counsellor: { include: { user: true } },
    },
    orderBy: { scheduledAt: "asc" },
    where:
      user.role === "CLIENT"
        ? { clientId: user.id }
        : user.role === "COUNSELLOR"
          ? { counsellorId: user.id }
          : undefined,
  });

  return appointments.map(mapAppointment);
}

export async function listRequestsForUser(user: SessionUser) {
  if (user.role !== "CLIENT" && user.role !== "ADMIN") {
    return [];
  }

  const requests = await prisma.counsellingRequest.findMany({
    include: {
      appointments: { select: { id: true }, take: 1 },
      assignedCounsellor: { include: { user: true } },
      client: { include: { user: true } },
      preferredCounsellor: { include: { user: true } },
      referral: { select: { employerId: true, id: true } },
    },
    orderBy: { createdAt: "desc" },
    where: user.role === "CLIENT" ? { clientId: user.id } : undefined,
  });

  return requests.map(mapRequest);
}
