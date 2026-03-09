import "server-only";

import type { Prisma } from "@prisma/client";

import { recordAuditEvent } from "@/server/auth/audit";
import type { SessionUser } from "@/server/auth/types";
import { prisma } from "@/server/db/prisma";
import { findClientByIdentifier, listUserIdsByRole } from "@/server/db/users";
import { createInAppNotification, listNotificationsForUser } from "@/server/notifications/service";
import { rejectCounsellingRequest } from "@/server/scheduling/service";
import { formatDisplayName } from "@/server/scheduling/read-model";
import type { ServiceType, UrgencyLevel } from "@/server/scheduling/types";

type ReferralRecord = Prisma.ReferralGetPayload<{
  include: {
    client: {
      include: {
        user: true;
      };
    };
    counsellingRequest: {
      select: {
        id: true;
      };
    };
    employer: {
      include: {
        user: true;
      };
    };
  };
}>;

function mapReferral(record: ReferralRecord) {
  return {
    clientId: record.clientId,
    clientName: formatDisplayName(record.client.user),
    counsellingRequestId: record.counsellingRequestId,
    createdAt: record.createdAt.toISOString(),
    employerId: record.employerId,
    employerName: formatDisplayName(record.employer.user),
    id: record.id,
    notes: record.notes ?? undefined,
    reason: record.rejectionReason ?? undefined,
    serviceType: record.serviceType,
    status: record.status,
    urgency: record.urgency,
  };
}

async function notifyAdmins(type: string, payload: Record<string, unknown>) {
  const adminIds = await listUserIdsByRole("ADMIN");
  await Promise.all(adminIds.map((userId) => createInAppNotification({ payload, type, userId })));
}

async function getReferralById(referralId: string) {
  const referral = await prisma.referral.findUnique({
    include: {
      client: {
        include: {
          user: true,
        },
      },
      counsellingRequest: {
        select: {
          id: true,
        },
      },
      employer: {
        include: {
          user: true,
        },
      },
    },
    where: {
      id: referralId,
    },
  });

  return referral ? mapReferral(referral) : null;
}

export async function listReferralsForUser(user: SessionUser) {
  if (user.role !== "EMPLOYER" && user.role !== "ADMIN") {
    return [];
  }

  const referrals = await prisma.referral.findMany({
    include: {
      client: {
        include: {
          user: true,
        },
      },
      counsellingRequest: {
        select: {
          id: true,
        },
      },
      employer: {
        include: {
          user: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    where: user.role === "EMPLOYER" ? { employerId: user.id } : undefined,
  });

  return referrals.map(mapReferral);
}

export async function createReferral(input: {
  actor: SessionUser;
  employeeIdentifier: string;
  ipAddress: string;
  notes?: string;
  serviceType: ServiceType;
  urgency: UrgencyLevel;
}) {
  if (input.actor.role !== "EMPLOYER") {
    return {
      code: "FORBIDDEN",
      message: "Only employers can submit referrals.",
      ok: false as const,
      status: 403,
    };
  }

  const client = await findClientByIdentifier(input.employeeIdentifier);

  if (!client || client.department !== input.actor.department) {
    return {
      code: "CLIENT_NOT_FOUND",
      message: "The employee could not be found in your department scope.",
      ok: false as const,
      status: 404,
    };
  }

  const createdReferral = await prisma.$transaction(async (tx) => {
    const request = await tx.counsellingRequest.create({
      data: {
        clientId: client.id,
        notes: input.notes,
        serviceType: input.serviceType,
        source: "EMPLOYER_REFERRAL",
        status: "PENDING_APPROVAL",
        urgency: input.urgency,
      },
      select: {
        id: true,
      },
    });

    return tx.referral.create({
      data: {
        clientId: client.id,
        counsellingRequestId: request.id,
        employerId: input.actor.id,
        notes: input.notes,
        serviceType: input.serviceType,
        status: "SUBMITTED",
        urgency: input.urgency,
      },
      select: {
        id: true,
      },
    });
  });

  const referral = await getReferralById(createdReferral.id);

  if (!referral) {
    return {
      code: "REFERRAL_MISSING",
      message: "The referral could not be loaded after creation.",
      ok: false as const,
      status: 500,
    };
  }

  await Promise.all([
    createInAppNotification({
      payload: {
        referralId: referral.id,
        serviceType: referral.serviceType,
        status: referral.status,
      },
      type: "REFERRAL_SUBMITTED",
      userId: input.actor.id,
    }),
    createInAppNotification({
      payload: {
        referralId: referral.id,
        serviceType: referral.serviceType,
        urgency: referral.urgency,
      },
      type: "EMPLOYER_REFERRAL_CREATED",
      userId: client.id,
    }),
    notifyAdmins("REFERRAL_PENDING_REVIEW", {
      referralId: referral.id,
      requestId: referral.counsellingRequestId,
      serviceType: referral.serviceType,
      urgency: referral.urgency,
    }),
  ]);

  recordAuditEvent({
    actorId: input.actor.id,
    actorRole: input.actor.role,
    eventType: "referral.created",
    ipAddress: input.ipAddress,
    metadata: {
      referralId: referral.id,
      requestId: referral.counsellingRequestId ?? "",
    },
    outcome: "SUCCESS",
  });

  return {
    data: referral,
    ok: true as const,
  };
}

export async function rejectReferral(input: {
  actor: SessionUser;
  ipAddress: string;
  reason: string;
  referralId: string;
}) {
  const referral = await getReferralById(input.referralId);

  if (!referral?.counsellingRequestId) {
    return {
      code: "NOT_FOUND",
      message: "Referral not found.",
      ok: false as const,
      status: 404,
    };
  }

  const result = await rejectCounsellingRequest({
    actor: input.actor,
    ipAddress: input.ipAddress,
    reason: input.reason,
    requestId: referral.counsellingRequestId,
  });

  if (!result.ok) {
    return result;
  }

  return {
    data: await getReferralById(input.referralId),
    ok: true as const,
  };
}

export async function getEmployerDashboardSnapshot(user: SessionUser) {
  const [referrals, notifications] = await Promise.all([
    listReferralsForUser(user),
    listNotificationsForUser(user, 8),
  ]);

  return {
    notifications,
    referrals,
    stats: {
      assigned: referrals.filter((referral) => referral.status === "ASSIGNED").length,
      rejected: referrals.filter((referral) => referral.status === "REJECTED").length,
      submitted: referrals.length,
    },
  };
}
