"use server";

import type { Route } from "next";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "@/server/auth/constants";
import { logoutInteractiveSession, signInWithPassword } from "@/server/auth/service";
import {
  clearAuthCookies,
  homePathForRole,
  setAuthCookies,
} from "@/server/auth/session";

const signInSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
  redirectTo: z.string().trim().optional(),
});

async function getRequestIpAddress() {
  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "127.0.0.1";
  }

  return headerStore.get("x-real-ip") ?? "127.0.0.1";
}

function buildErrorRedirect(pathname: string, message: string) {
  const searchParams = new URLSearchParams();
  searchParams.set("error", message);
  return `${pathname}?${searchParams.toString()}`;
}

export async function signInAction(formData: FormData) {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    redirectTo: formData.get("redirectTo") ?? undefined,
  });

  if (!parsed.success) {
    redirect(buildErrorRedirect("/sign-in", "Enter a valid email and password.") as Route);
  }

  const result = await signInWithPassword({
    email: parsed.data.email,
    ipAddress: await getRequestIpAddress(),
    password: parsed.data.password,
    redirectTo: parsed.data.redirectTo,
  });

  if (!result.ok) {
    redirect(buildErrorRedirect("/sign-in", result.message) as Route);
  }

  const cookieStore = await cookies();
  setAuthCookies(cookieStore, {
    accessToken: result.data.accessToken,
    refreshToken: result.data.refreshToken,
  });

  redirect((result.data.redirectTo ?? homePathForRole(result.data.user.role)) as Route);
}

export async function signOutAction() {
  const cookieStore = await cookies();

  await logoutInteractiveSession({
    accessToken: cookieStore.get(ACCESS_TOKEN_COOKIE)?.value,
    ipAddress: await getRequestIpAddress(),
    refreshToken: cookieStore.get(REFRESH_TOKEN_COOKIE)?.value,
  });

  clearAuthCookies(cookieStore);
  redirect("/sign-in" as Route);
}
