import "server-only";

import { recordAuditEvent } from "@/server/auth/audit";
import type { SessionUser } from "@/server/auth/types";
import { prisma as db } from "@/server/db/prisma";
import { listUserIdsByRole } from "@/server/db/users";
import {
  createInAppNotification,
  listNotificationsForUser,
} from "@/server/notifications/service";
import {
  createTimeValue,
  formatRequestSourceLabel,
  formatServiceTypeLabel,
  getAppointmentRecordById,
  getAvailabilityTemplates,
  getCounsellorAvailability,
  getCounsellorProfile,
  getRequestRecordById,
  isSlotConflictError,
  listAppointmentsForUser,
  listCounsellors,
  listRequestsForUser,
  mapAppointment,
  mapRequest,
  normaliseScheduledAt,
} from "@/server/scheduling/read-model";
import type {
  AvailabilityRule,
  RequestSource,
  ServiceType,
  UrgencyLevel,
} from "@/server/scheduling/types";

const REQUEST_MUTABLE_SOURCES = new Set<RequestSource>([
  "SELF_SERVICE",
  "WAITLIST",
  "SPECIFIC_COUNSELLOR",
]);

async function notifyAdmins(type: string, payload: Record<string, unknown>) {
  const adminIds = await listUserIdsByRole("ADMIN");
  await Promise.all(adminIds.map((userId) => createInAppNotification({ payload, type, userId })));
}

export { formatRequestSourceLabel, formatServiceTypeLabel };

export { getCounsellorAvailability, listAppointmentsForUser, listCounsellors, listRequestsForUser };

export { getAvailabilityTemplates };

export async function upsertCounsellorAvailability(input: {
  actor: SessionUser;
  ipAddress: string;
  rules: Array<Pick<AvailabilityRule, "dayOfWeek" | "endTime" | "startTime">>;
}) {
  if (input.actor.role !== "COUNSELLOR") {
    return {
      code: "FORBIDDEN",
      message: "Only counsellors can manage recurring availability.",
      ok: false as const,
      status: 403,
    };
  }

  const preparedRules: Array<{
    counsellorId: string;
    dayOfWeek: number;
    endTime: Date;
    isActive: true;
    startTime: Date;
  }> = [];

  for (const rule of input.rules) {
    const startTime = rule.startTime.trim();
    const endTime = rule.endTime.trim();

    if (!startTime && !endTime) {
      continue;
    }

    if (!startTime || !endTime || startTime >= endTime) {
      return {
        code: "INVALID_AVAILABILITY",
        message: "Each availability window must include a valid start and end time.",
        ok: false as const,
        status: 400,
      };
    }

    preparedRules.push({
      counsellorId: input.actor.id,
      dayOfWeek: rule.dayOfWeek,
      endTime: createTimeValue(endTime),
      isActive: true,
      startTime: createTimeValue(startTime),
    });
  }

  await db.$transaction(async (tx) => {
    await tx.counsellorAvailabilityRule.deleteMany({
      where: {
        counsellorId: input.actor.id,
      },
    });

    if (preparedRules.length) {
      await tx.counsellorAvailabilityRule.createMany({
        data: preparedRules,
      });
    }
  });

  recordAuditEvent({
    actorId: input.actor.id,
    actorRole: input.actor.role,
    eventType: "availability.updated",
    ipAddress: input.ipAddress,
    metadata: {
      counsellorId: input.actor.id,
    },
    outcome: "SUCCESS",
  });

  return {
    data: await getAvailabilityTemplates(input.actor.id),
    ok: true as const,
  };
}

export async function createAppointment(input: {
  actor: SessionUser;
  counsellorId: string;
  ipAddress: string;
  scheduledAt: string;
  serviceType: ServiceType;
}) {
  if (input.actor.role !== "CLIENT") {
    return {
      code: "FORBIDDEN",
      message: "Only clients can create direct bookings.",
      ok: false as const,
      status: 403,
    };
  }

  const scheduledAt = normaliseScheduledAt(input.scheduledAt);

  if (!scheduledAt) {
    return {
      code: "INVALID_REQUEST",
      message: "Provide a valid scheduledAt value.",
      ok: false as const,
      status: 400,
    };
  }

  const openSlot = (await getCounsellorAvailability(input.counsellorId, 30)).find(
    (slot) => slot.startsAt === scheduledAt.toISOString(),
  );

  if (!openSlot) {
    return {
      code: "SLOT_UNAVAILABLE",
      message: "That appointment slot is no longer available.",
      ok: false as const,
      status: 409,
    };
  }

  let appointmentId: string;

  try {
    const appointment = await db.appointment.create({
      data: {
        clientId: input.actor.id,
        counsellorId: input.counsellorId,
        modality: "VIDEO",
        scheduledAt,
        serviceType: input.serviceType,
        status: "SCHEDULED",
      },
      select: {
        id: true,
      },
    });

    appointmentId = appointment.id;
  } catch (error) {
    if (isSlotConflictError(error)) {
      return {
        code: "SLOT_UNAVAILABLE",
        message: "That appointment slot is no longer available.",
        ok: false as const,
        status: 409,
      };
    }

    throw error;
  }

  const appointmentRecord = await getAppointmentRecordById(appointmentId);

  if (!appointmentRecord) {
    return {
      code: "APPOINTMENT_MISSING",
      message: "Appointment could not be loaded after creation.",
      ok: false as const,
      status: 500,
    };
  }

  const appointment = mapAppointment(appointmentRecord);

  await Promise.all([
    createInAppNotification({
      payload: {
        appointmentId,
        counsellorName: appointment.counsellorName,
        scheduledAt: appointment.scheduledAt,
        serviceType: appointment.serviceType,
      },
      type: "BOOKING_CONFIRMED",
      userId: input.actor.id,
    }),
    createInAppNotification({
      payload: {
        appointmentId,
        clientName: appointment.clientName,
        scheduledAt: appointment.scheduledAt,
        serviceType: appointment.serviceType,
      },
      type: "NEW_BOOKING_ASSIGNED",
      userId: input.counsellorId,
    }),
  ]);

  recordAuditEvent({
    actorId: input.actor.id,
    actorRole: input.actor.role,
    eventType: "appointment.created",
    ipAddress: input.ipAddress,
    metadata: {
      appointmentId,
      counsellorId: input.counsellorId,
      serviceType: input.serviceType,
    },
    outcome: "SUCCESS",
  });

  return {
    data: appointment,
    ok: true as const,
  };
}

export async function cancelAppointment(input: {
  actor: SessionUser;
  appointmentId: string;
  ipAddress: string;
}) {
  const appointmentRecord = await getAppointmentRecordById(input.appointmentId);

  if (!appointmentRecord) {
    return {
      code: "NOT_FOUND",
      message: "Appointment not found.",
      ok: false as const,
      status: 404,
    };
  }

  const appointment = mapAppointment(appointmentRecord);
  const actorCanCancel =
    (input.actor.role === "CLIENT" && appointment.clientId === input.actor.id) ||
    input.actor.role === "ADMIN";

  if (!actorCanCancel) {
    return {
      code: "FORBIDDEN",
      message: "You do not have permission to cancel this appointment.",
      ok: false as const,
      status: 403,
    };
  }

  if (input.actor.role === "CLIENT") {
    const hoursUntilAppointment =
      (new Date(appointment.scheduledAt).getTime() - Date.now()) / (1000 * 60 * 60);

    if (hoursUntilAppointment < 24) {
      return {
        code: "LATE_CANCELLATION",
        message: "Clients can only cancel at least 24 hours before the session.",
        ok: false as const,
        status: 409,
      };
    }
  }

  await db.appointment.update({
    data: {
      cancelledAt: new Date(),
      cancelledBy: input.actor.id,
      status: "CANCELLED",
    },
    where: {
      id: input.appointmentId,
    },
  });

  await Promise.all([
    createInAppNotification({
      payload: {
        appointmentId: input.appointmentId,
        scheduledAt: appointment.scheduledAt,
      },
      type: "BOOKING_CANCELLED",
      userId: appointment.clientId,
    }),
    createInAppNotification({
      payload: {
        appointmentId: input.appointmentId,
        scheduledAt: appointment.scheduledAt,
      },
      type: "BOOKING_CANCELLED",
      userId: appointment.counsellorId,
    }),
  ]);

  recordAuditEvent({
    actorId: input.actor.id,
    actorRole: input.actor.role,
    eventType: "appointment.cancelled",
    ipAddress: input.ipAddress,
    metadata: {
      appointmentId: input.appointmentId,
    },
    outcome: "SUCCESS",
  });

  return {
    data: {
      ...appointment,
      status: "CANCELLED" as const,
    },
    ok: true as const,
  };
}

export async function createCounsellingRequest(input: {
  actor: SessionUser;
  ipAddress: string;
  notes?: string;
  preferredCounsellorId?: string;
  serviceType: ServiceType;
  source: RequestSource;
  urgency: UrgencyLevel;
}) {
  if (input.actor.role !== "CLIENT") {
    return {
      code: "FORBIDDEN",
      message: "Only clients can create counselling requests.",
      ok: false as const,
      status: 403,
    };
  }

  if (!REQUEST_MUTABLE_SOURCES.has(input.source)) {
    return {
      code: "INVALID_SOURCE",
      message: "Clients can only submit self-service, waitlist, or specific-counsellor requests.",
      ok: false as const,
      status: 400,
    };
  }

  if (input.source === "SPECIFIC_COUNSELLOR" && !input.preferredCounsellorId) {
    return {
      code: "INVALID_REQUEST",
      message: "A preferred counsellor is required for specific-counsellor requests.",
      ok: false as const,
      status: 400,
    };
  }

  if (input.preferredCounsellorId) {
    const counsellor = await db.counsellor.findUnique({
      select: {
        userId: true,
      },
      where: {
        userId: input.preferredCounsellorId,
      },
    });

    if (!counsellor) {
      return {
        code: "COUNSELLOR_NOT_FOUND",
        message: "The preferred counsellor could not be found.",
        ok: false as const,
        status: 404,
      };
    }
  }

  const requestRecord = await db.counsellingRequest.create({
    data: {
      clientId: input.actor.id,
      notes: input.notes,
      preferredCounsellorId: input.preferredCounsellorId,
      serviceType: input.serviceType,
      source: input.source,
      status: "PENDING_APPROVAL",
      urgency: input.urgency,
    },
    include: {
      appointments: { select: { id: true }, take: 1 },
      assignedCounsellor: { include: { user: true } },
      client: { include: { user: true } },
      preferredCounsellor: { include: { user: true } },
      referral: { select: { employerId: true, id: true } },
    },
  });

  const request = mapRequest(requestRecord);

  await Promise.all([
    createInAppNotification({
      payload: {
        requestId: request.id,
        serviceType: request.serviceType,
        status: request.status,
      },
      type: "REQUEST_SUBMITTED",
      userId: input.actor.id,
    }),
    notifyAdmins("REQUEST_PENDING_REVIEW", {
      requestId: request.id,
      serviceType: request.serviceType,
      source: request.source,
      urgency: request.urgency,
    }),
  ]);

  recordAuditEvent({
    actorId: input.actor.id,
    actorRole: input.actor.role,
    eventType: "request.created",
    ipAddress: input.ipAddress,
    metadata: {
      requestId: request.id,
      source: request.source,
    },
    outcome: "SUCCESS",
  });

  return {
    data: request,
    ok: true as const,
  };
}

export async function assignCounsellingRequest(input: {
  actor: SessionUser;
  counsellorId: string;
  ipAddress: string;
  requestId: string;
  scheduledAt: string;
}) {
  if (input.actor.role !== "ADMIN") {
    return {
      code: "FORBIDDEN",
      message: "Only admins can assign counselling requests.",
      ok: false as const,
      status: 403,
    };
  }

  const scheduledAt = normaliseScheduledAt(input.scheduledAt);

  if (!scheduledAt) {
    return {
      code: "INVALID_REQUEST",
      message: "Provide a valid scheduledAt value.",
      ok: false as const,
      status: 400,
    };
  }

  const requestRecord = await getRequestRecordById(input.requestId);

  if (!requestRecord || requestRecord.status !== "PENDING_APPROVAL") {
    return {
      code: "INVALID_REQUEST",
      message: "This request is no longer pending assignment.",
      ok: false as const,
      status: 409,
    };
  }

  if (
    requestRecord.preferredCounsellorId &&
    requestRecord.preferredCounsellorId !== input.counsellorId
  ) {
    return {
      code: "PREFERRED_COUNSELLOR_REQUIRED",
      message: "This request must be assigned to the preferred counsellor.",
      ok: false as const,
      status: 409,
    };
  }

  const openSlot = (await getCounsellorAvailability(input.counsellorId, 30)).find(
    (slot) => slot.startsAt === scheduledAt.toISOString(),
  );

  if (!openSlot) {
    return {
      code: "SLOT_UNAVAILABLE",
      message: "That assignment slot is no longer available.",
      ok: false as const,
      status: 409,
    };
  }

  let appointmentId: string;

  try {
    const appointment = await db.$transaction(async (tx) => {
      const updated = await tx.counsellingRequest.updateMany({
        data: {
          assignedAt: new Date(),
          assignedCounsellorId: input.counsellorId,
          status: "ASSIGNED",
        },
        where: {
          id: input.requestId,
          status: "PENDING_APPROVAL",
        },
      });

      if (updated.count !== 1) {
        throw new Error("INVALID_REQUEST_STATE");
      }

      const createdAppointment = await tx.appointment.create({
        data: {
          clientId: requestRecord.clientId,
          counsellingRequestId: input.requestId,
          counsellorId: input.counsellorId,
          modality: "IN_PERSON",
          scheduledAt,
          serviceType: requestRecord.serviceType,
          status: "SCHEDULED",
        },
        select: {
          id: true,
        },
      });

      await tx.referral.updateMany({
        data: {
          status: "ASSIGNED",
        },
        where: {
          counsellingRequestId: input.requestId,
        },
      });

      return createdAppointment;
    });

    appointmentId = appointment.id;
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_REQUEST_STATE") {
      return {
        code: "INVALID_REQUEST",
        message: "This request is no longer pending assignment.",
        ok: false as const,
        status: 409,
      };
    }

    if (isSlotConflictError(error)) {
      return {
        code: "SLOT_UNAVAILABLE",
        message: "That assignment slot is no longer available.",
        ok: false as const,
        status: 409,
      };
    }

    throw error;
  }

  const [updatedRequestRecord, appointmentRecord] = await Promise.all([
    getRequestRecordById(input.requestId),
    getAppointmentRecordById(appointmentId),
  ]);

  if (!updatedRequestRecord || !appointmentRecord) {
    return {
      code: "ASSIGNMENT_MISSING",
      message: "The assigned records could not be loaded.",
      ok: false as const,
      status: 500,
    };
  }

  const request = mapRequest(updatedRequestRecord);
  const appointment = mapAppointment(appointmentRecord);
  const notifications = [
    createInAppNotification({
      payload: {
        appointmentId: appointment.id,
        counsellorName: appointment.counsellorName,
        scheduledAt: appointment.scheduledAt,
      },
      type: "REQUEST_ASSIGNED",
      userId: request.clientId,
    }),
    createInAppNotification({
      payload: {
        appointmentId: appointment.id,
        clientName: appointment.clientName,
        scheduledAt: appointment.scheduledAt,
      },
      type: "REQUEST_ASSIGNED",
      userId: input.counsellorId,
    }),
  ];

  if (updatedRequestRecord.referral) {
    notifications.push(
      createInAppNotification({
        payload: {
          referralId: updatedRequestRecord.referral.id,
          requestId: request.id,
          scheduledAt: appointment.scheduledAt,
          status: "ASSIGNED",
        },
        type: "REFERRAL_STATUS_UPDATED",
        userId: updatedRequestRecord.referral.employerId,
      }),
    );
  }

  await Promise.all(notifications);

  recordAuditEvent({
    actorId: input.actor.id,
    actorRole: input.actor.role,
    eventType: "request.assigned",
    ipAddress: input.ipAddress,
    metadata: {
      appointmentId: appointment.id,
      requestId: request.id,
    },
    outcome: "SUCCESS",
  });

  return {
    data: {
      appointment,
      request,
    },
    ok: true as const,
  };
}

export async function rejectCounsellingRequest(input: {
  actor: SessionUser;
  ipAddress: string;
  reason: string;
  requestId: string;
}) {
  if (input.actor.role !== "ADMIN") {
    return {
      code: "FORBIDDEN",
      message: "Only admins can reject counselling requests.",
      ok: false as const,
      status: 403,
    };
  }

  const updated = await db.$transaction(async (tx) => {
    const requestUpdate = await tx.counsellingRequest.updateMany({
      data: {
        adminReason: input.reason,
        rejectedAt: new Date(),
        status: "REJECTED",
      },
      where: {
        id: input.requestId,
        status: "PENDING_APPROVAL",
      },
    });

    if (requestUpdate.count !== 1) {
      return false;
    }

    await tx.referral.updateMany({
      data: {
        rejectionReason: input.reason,
        status: "REJECTED",
      },
      where: {
        counsellingRequestId: input.requestId,
      },
    });

    return true;
  });

  if (!updated) {
    return {
      code: "INVALID_REQUEST",
      message: "This request is no longer pending review.",
      ok: false as const,
      status: 409,
    };
  }

  const requestRecord = await getRequestRecordById(input.requestId);

  if (!requestRecord) {
    return {
      code: "REQUEST_MISSING",
      message: "The rejected request could not be loaded.",
      ok: false as const,
      status: 500,
    };
  }

  const request = mapRequest(requestRecord);
  const notifications = [
    createInAppNotification({
      payload: {
        reason: input.reason,
        requestId: request.id,
        status: request.status,
      },
      type: "REQUEST_REJECTED",
      userId: request.clientId,
    }),
  ];

  if (requestRecord.referral) {
    notifications.push(
      createInAppNotification({
        payload: {
          reason: input.reason,
          referralId: requestRecord.referral.id,
          requestId: request.id,
          status: "REJECTED",
        },
        type: "REFERRAL_STATUS_UPDATED",
        userId: requestRecord.referral.employerId,
      }),
    );
  }

  await Promise.all(notifications);

  recordAuditEvent({
    actorId: input.actor.id,
    actorRole: input.actor.role,
    eventType: "request.rejected",
    ipAddress: input.ipAddress,
    metadata: {
      requestId: request.id,
    },
    outcome: "SUCCESS",
  });

  return {
    data: request,
    ok: true as const,
  };
}

export async function getClientDashboardSnapshot(user: SessionUser) {
  const [appointments, counsellors, requests, notifications] = await Promise.all([
    listAppointmentsForUser(user),
    listCounsellors(),
    listRequestsForUser(user),
    listNotificationsForUser(user, 6),
  ]);

  const counsellorsWithSlots = await Promise.all(
    counsellors.map(async (counsellor) => ({
      ...counsellor,
      nextSlots: (await getCounsellorAvailability(counsellor.id, 14)).slice(0, 4),
    })),
  );

  return {
    appointments,
    counsellors: counsellorsWithSlots,
    notifications,
    requests,
  };
}

export async function getCounsellorDashboardSnapshot(user: SessionUser) {
  const [appointments, availabilityRules, nextOpenSlots, notifications, counsellor] =
    await Promise.all([
      listAppointmentsForUser(user),
      getAvailabilityTemplates(user.id),
      getCounsellorAvailability(user.id, 14),
      listNotificationsForUser(user, 6),
      getCounsellorProfile(user.id),
    ]);

  return {
    appointments,
    availabilityRules,
    caseload: `${appointments.filter((item) => item.status === "SCHEDULED").length} / ${
      counsellor?.maxCaseload ?? 25
    }`,
    nextOpenSlots: nextOpenSlots.slice(0, 6),
    notifications,
  };
}

export async function getAdminDashboardSnapshot(user: SessionUser) {
  const [queue, scheduledAppointments, notifications, counsellors] = await Promise.all([
    listRequestsForUser(user),
    listAppointmentsForUser(user),
    listNotificationsForUser(user, 8),
    listCounsellors(),
  ]);

  const counsellorsWithSlots = await Promise.all(
    counsellors.map(async (counsellor) => ({
      ...counsellor,
      nextSlots: (await getCounsellorAvailability(counsellor.id, 14)).slice(0, 3),
    })),
  );

  return {
    counsellors: counsellorsWithSlots,
    notifications,
    queue: queue.filter((request) => request.status === "PENDING_APPROVAL"),
    scheduledAppointments: scheduledAppointments.filter(
      (appointment) => appointment.status === "SCHEDULED",
    ),
  };
}
