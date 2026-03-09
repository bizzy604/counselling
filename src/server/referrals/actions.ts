"use server";

import type { Route } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getSessionUser } from "@/server/auth/session";
import { createReferral } from "@/server/referrals/service";
import { serviceTypes, urgencyLevels } from "@/server/scheduling/types";

const referralSchema = z.object({
  employeeIdentifier: z.string().trim().min(1),
  notes: z.string().trim().max(500).optional(),
  serviceType: z.enum(serviceTypes),
  urgency: z.enum(urgencyLevels),
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

export async function createReferralAction(formData: FormData) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/sign-in" as Route);
  }

  const parsed = referralSchema.safeParse({
    employeeIdentifier: formData.get("employeeIdentifier"),
    notes: formData.get("notes") || undefined,
    serviceType: formData.get("serviceType"),
    urgency: formData.get("urgency"),
  });

  if (!parsed.success) {
    redirect(buildRedirect("/employer", "Provide a valid referral form.", "error"));
  }

  const result = await createReferral({
    actor: user,
    employeeIdentifier: parsed.data.employeeIdentifier,
    ipAddress: await getRequestIpAddress(),
    notes: parsed.data.notes,
    serviceType: parsed.data.serviceType,
    urgency: parsed.data.urgency,
  });

  if (!result.ok) {
    redirect(buildRedirect("/employer", result.message, "error"));
  }

  redirect(buildRedirect("/employer", "Referral submitted to the admin queue.", "success"));
}
