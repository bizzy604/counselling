"use server";

import type { Route } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getSessionUser } from "@/server/auth/session";
import {
  assignCounsellingRequest,
  cancelAppointment,
  createAppointment,
  createCounsellingRequest,
  rejectCounsellingRequest,
  upsertCounsellorAvailability,
} from "@/server/scheduling/service";
import {
  requestSources,
  serviceTypes,
  urgencyLevels,
} from "@/server/scheduling/types";

const appointmentSchema = z.object({
  counsellorId: z.string().min(1),
  scheduledAt: z.string().datetime(),
  serviceType: z.enum(serviceTypes),
});

const requestSchema = z.object({
  notes: z.string().trim().max(500).optional(),
  preferredCounsellorId: z.string().trim().optional(),
  serviceType: z.enum(serviceTypes),
  source: z.enum(requestSources),
  urgency: z.enum(urgencyLevels),
});

const assignSchema = z.object({
  counsellorId: z.string().min(1),
  requestId: z.string().min(1),
  scheduledAt: z.string().datetime(),
});

const rejectSchema = z.object({
  reason: z.string().trim().min(5).max(300),
  requestId: z.string().min(1),
});

const cancelSchema = z.object({
  appointmentId: z.string().min(1),
});

async function getRequestIpAddress() {
  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "127.0.0.1";
  }

  return headerStore.get("x-real-ip") ?? "127.0.0.1";
}

function buildRedirect(pathname: string, notice: string, tone: "error" | "success") {
  const searchParams = new URLSearchParams({
    notice,
    tone,
  });

  return `${pathname}?${searchParams.toString()}` as Route;
}

export async function createAppointmentAction(formData: FormData) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/sign-in" as Route);
  }

  const parsed = appointmentSchema.safeParse({
    counsellorId: formData.get("counsellorId"),
    scheduledAt: formData.get("scheduledAt"),
    serviceType: formData.get("serviceType"),
  });

  if (!parsed.success) {
    redirect(buildRedirect("/client", "Select a valid service type and open slot.", "error"));
  }

  const result = await createAppointment({
    actor: user,
    counsellorId: parsed.data.counsellorId,
    ipAddress: await getRequestIpAddress(),
    scheduledAt: parsed.data.scheduledAt,
    serviceType: parsed.data.serviceType,
  });

  if (!result.ok) {
    redirect(buildRedirect("/client", result.message, "error"));
  }

  redirect(buildRedirect("/client", "Appointment booked successfully.", "success"));
}

export async function cancelAppointmentAction(formData: FormData) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/sign-in" as Route);
  }

  const parsed = cancelSchema.safeParse({
    appointmentId: formData.get("appointmentId"),
  });

  if (!parsed.success) {
    redirect(buildRedirect("/client", "The appointment could not be cancelled.", "error"));
  }

  const result = await cancelAppointment({
    actor: user,
    appointmentId: parsed.data.appointmentId,
    ipAddress: await getRequestIpAddress(),
  });

  if (!result.ok) {
    redirect(buildRedirect("/client", result.message, "error"));
  }

  redirect(buildRedirect("/client", "Appointment cancelled.", "success"));
}

export async function createCounsellingRequestAction(formData: FormData) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/sign-in" as Route);
  }

  const parsed = requestSchema.safeParse({
    notes: formData.get("notes") || undefined,
    preferredCounsellorId: formData.get("preferredCounsellorId") || undefined,
    serviceType: formData.get("serviceType"),
    source: formData.get("source"),
    urgency: formData.get("urgency"),
  });

  if (!parsed.success) {
    redirect(buildRedirect("/client", "Provide a valid request configuration.", "error"));
  }

  const result = await createCounsellingRequest({
    actor: user,
    ipAddress: await getRequestIpAddress(),
    notes: parsed.data.notes,
    preferredCounsellorId: parsed.data.preferredCounsellorId || undefined,
    serviceType: parsed.data.serviceType,
    source: parsed.data.source,
    urgency: parsed.data.urgency,
  });

  if (!result.ok) {
    redirect(buildRedirect("/client", result.message, "error"));
  }

  redirect(buildRedirect("/client", "Counselling request submitted to Admin.", "success"));
}

export async function saveAvailabilityAction(formData: FormData) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/sign-in" as Route);
  }

  const rules = [1, 2, 3, 4, 5].map((dayOfWeek) => ({
    dayOfWeek,
    endTime: `${formData.get(`day-${dayOfWeek}-end`) ?? ""}`,
    startTime: `${formData.get(`day-${dayOfWeek}-start`) ?? ""}`,
  }));

  const result = await upsertCounsellorAvailability({
    actor: user,
    ipAddress: await getRequestIpAddress(),
    rules,
  });

  if (!result.ok) {
    redirect(buildRedirect("/counsellor", result.message, "error"));
  }

  redirect(buildRedirect("/counsellor", "Availability updated.", "success"));
}

export async function assignCounsellingRequestAction(formData: FormData) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/sign-in" as Route);
  }

  const assignment = `${formData.get("assignment") ?? ""}`;
  const [counsellorId, scheduledAt] = assignment.split("||");
  const parsed = assignSchema.safeParse({
    counsellorId,
    requestId: formData.get("requestId"),
    scheduledAt,
  });

  if (!parsed.success) {
    redirect(buildRedirect("/admin", "Select a valid assignment slot.", "error"));
  }

  const result = await assignCounsellingRequest({
    actor: user,
    counsellorId: parsed.data.counsellorId,
    ipAddress: await getRequestIpAddress(),
    requestId: parsed.data.requestId,
    scheduledAt: parsed.data.scheduledAt,
  });

  if (!result.ok) {
    redirect(buildRedirect("/admin", result.message, "error"));
  }

  redirect(buildRedirect("/admin", "Counselling request assigned.", "success"));
}

export async function rejectCounsellingRequestAction(formData: FormData) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/sign-in" as Route);
  }

  const parsed = rejectSchema.safeParse({
    reason: formData.get("reason"),
    requestId: formData.get("requestId"),
  });

  if (!parsed.success) {
    redirect(buildRedirect("/admin", "Provide a rejection reason.", "error"));
  }

  const result = await rejectCounsellingRequest({
    actor: user,
    ipAddress: await getRequestIpAddress(),
    reason: parsed.data.reason,
    requestId: parsed.data.requestId,
  });

  if (!result.ok) {
    redirect(buildRedirect("/admin", result.message, "error"));
  }

  redirect(buildRedirect("/admin", "Request rejected.", "success"));
}
