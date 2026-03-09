"use server";

import { requireRole } from "@/server/auth/session";
import {
  getPlatformSettings,
  savePlatformSettings,
  getClientSettings,
  saveClientSettings,
  getCounsellorSettings,
  saveCounsellorSettings,
  createUser,
  updateUser,
  getClientProfile,
  saveClientProfile,
} from "@/server/admin/service";
import { createMoodEntry } from "@/server/mood/service";
import { createJournalEntry } from "@/server/journal/service";
import { createSessionNote, lockSessionNote, listCounsellorClients } from "@/server/notes/service";
import { createCrisisEvent } from "@/server/crisis/service";
import { assignContentToClient, createContent, updateContent } from "@/server/content/service";

// ─── Admin settings ─────────────────────────────────────────────

export async function loadPlatformSettings() {
  await requireRole("ADMIN");
  return getPlatformSettings();
}

export async function updatePlatformSettings(settings: {
  sessionDuration: number;
  maxCaseload: number;
  bookingWindow: number;
  cancelDeadline: number;
}) {
  await requireRole("ADMIN");
  await savePlatformSettings(settings);
}

// ─── Admin user management ──────────────────────────────────────

export async function addUser(input: {
  firstName: string;
  lastName: string;
  email: string;
  role: "CLIENT" | "COUNSELLOR" | "EMPLOYER" | "ADMIN";
  department: string;
  password: string;
}) {
  await requireRole("ADMIN");
  return createUser(input);
}

export async function editUser(userId: string, input: {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: "CLIENT" | "COUNSELLOR" | "EMPLOYER" | "ADMIN";
  department?: string;
  isActive?: boolean;
}) {
  await requireRole("ADMIN");
  return updateUser(userId, input);
}

// ─── Client settings ────────────────────────────────────────────

export async function loadClientSettings() {
  const user = await requireRole("CLIENT");
  return getClientSettings(user.id);
}

export async function updateClientSettings(settings: {
  moodSharing: boolean;
  emailNotifications: boolean;
}) {
  const user = await requireRole("CLIENT");
  await saveClientSettings(user.id, settings);
}

export async function loadClientProfile() {
  const user = await requireRole("CLIENT");
  return getClientProfile(user.id);
}

export async function updateClientProfile(input: {
  firstName: string;
  lastName: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  preferredLanguage: string;
}) {
  const user = await requireRole("CLIENT");
  await saveClientProfile(user.id, input);
}

// ─── Counsellor settings ────────────────────────────────────────

export async function loadCounsellorSettings() {
  const user = await requireRole("COUNSELLOR");
  return getCounsellorSettings(user.id);
}

export async function updateCounsellorSettings(settings: {
  bio: string;
  specialisations: string;
  languages: string;
  maxCaseload: number;
}) {
  const user = await requireRole("COUNSELLOR");
  await saveCounsellorSettings(user.id, settings);
}

// ─── Mood check-in ──────────────────────────────────────────────

export async function submitMoodCheckIn(value: number, note?: string) {
  const user = await requireRole("CLIENT");
  return createMoodEntry({ user, value, note });
}

// ─── Journal ────────────────────────────────────────────────────

export async function submitJournalEntry(prompt: string, body: string) {
  const user = await requireRole("CLIENT");
  return createJournalEntry({ user, prompt, body });
}

// ─── Session notes ──────────────────────────────────────────────

export async function loadMyClients() {
  const user = await requireRole("COUNSELLOR");
  return listCounsellorClients(user.id);
}

export async function submitSessionNote(input: {
  clientId: string;
  appointmentId?: string;
  content: string;
}) {
  const user = await requireRole("COUNSELLOR");
  return createSessionNote({ user, ...input });
}

export async function lockNote(noteId: string) {
  const user = await requireRole("COUNSELLOR");
  return lockSessionNote({ user, noteId });
}

// ─── Crisis events ──────────────────────────────────────────────

export async function submitCrisisEvent(input: {
  severity: "LOW" | "MEDIUM" | "HIGH";
  notes?: string;
}) {
  const user = await requireRole("CLIENT");
  return createCrisisEvent({ user, ...input });
}

// ─── Content assignment ─────────────────────────────────────────

export async function assignContent(contentId: string, clientId: string) {
  const user = await requireRole("COUNSELLOR");
  await assignContentToClient({ contentId, clientId, assignedBy: user.id });
}

// ─── Admin content management ───────────────────────────────────

export async function addContent(input: {
  title: string;
  body?: string;
  category: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}) {
  const user = await requireRole("ADMIN");
  return createContent({ ...input, authorId: user.id });
}

export async function editContent(contentId: string, input: {
  title?: string;
  body?: string;
  category?: string;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}) {
  await requireRole("ADMIN");
  return updateContent(contentId, input);
}
