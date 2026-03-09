import { NextRequest } from "next/server";

import { getRequestSession } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { failure } from "@/server/v1/response";

function csvRow(values: string[]) {
  return values.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",");
}

async function generateUtilisation() {
  const counsellors = await prisma.counsellor.findMany({
    include: {
      user: true,
      appointments: { where: { status: { in: ["SCHEDULED", "ATTENDED"] } } },
    },
  });

  const header = csvRow(["Name", "Licence", "Max Caseload", "Active Sessions", "Completed", "Utilisation %"]);
  const rows = counsellors.map((c) => {
    const active = c.appointments.filter((a) => a.status === "SCHEDULED").length;
    const completed = c.appointments.filter((a) => a.status === "ATTENDED").length;
    const util = c.maxCaseload > 0 ? Math.round((active / c.maxCaseload) * 100) : 0;
    return csvRow([
      `${c.user.firstName} ${c.user.lastName}`,
      c.licenceNumber,
      String(c.maxCaseload),
      String(active),
      String(completed),
      String(util),
    ]);
  });

  return [header, ...rows].join("\n");
}

async function generateMoodTrends() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const entries = await prisma.moodEntry.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    include: { client: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
  });

  const header = csvRow(["Date", "Client", "Value", "Note"]);
  const rows = entries.map((e) =>
    csvRow([
      e.createdAt.toISOString().slice(0, 10),
      `${e.client.user.firstName} ${e.client.user.lastName}`,
      String(e.value),
      e.note ?? "",
    ]),
  );

  return [header, ...rows].join("\n");
}

async function generateReferrals() {
  const referrals = await prisma.referral.findMany({
    include: {
      employer: { include: { user: true } },
      client: { include: { user: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const header = csvRow(["Date", "Employer", "Client", "Service Type", "Urgency", "Status"]);
  const rows = referrals.map((r) =>
    csvRow([
      r.createdAt.toISOString().slice(0, 10),
      `${r.employer.user.firstName} ${r.employer.user.lastName}`,
      `${r.client.user.firstName} ${r.client.user.lastName}`,
      r.serviceType,
      r.urgency,
      r.status,
    ]),
  );

  return [header, ...rows].join("\n");
}

async function generateCrisis() {
  const events = await prisma.crisisEvent.findMany({
    include: { client: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
  });

  const header = csvRow(["Date", "Client", "Severity", "Follow-up Status", "Notes"]);
  const rows = events.map((e) =>
    csvRow([
      e.createdAt.toISOString().slice(0, 10),
      `${e.client.user.firstName} ${e.client.user.lastName}`,
      e.severity,
      e.followUpStatus,
      e.notes ?? "",
    ]),
  );

  return [header, ...rows].join("\n");
}

async function generateAudit() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { occurredAt: "desc" },
    take: 5000,
  });

  const header = csvRow(["Timestamp", "User ID", "Action", "Target Table", "Target ID", "IP"]);
  const rows = logs.map((l) =>
    csvRow([
      l.occurredAt.toISOString(),
      l.userId,
      l.action,
      l.targetTable,
      l.targetId,
      l.ipAddress ?? "",
    ]),
  );

  return [header, ...rows].join("\n");
}

const generators: Record<string, () => Promise<string>> = {
  utilisation: generateUtilisation,
  "mood-trends": generateMoodTrends,
  referrals: generateReferrals,
  crisis: generateCrisis,
  audit: generateAudit,
};

export async function GET(request: NextRequest) {
  const session = await getRequestSession(request);
  if (!session || session.user.role !== "ADMIN") {
    return failure("FORBIDDEN", "Admin access required", 403);
  }

  const type = request.nextUrl.searchParams.get("type");
  if (!type || !generators[type]) {
    return failure("BAD_REQUEST", "Invalid report type", 400);
  }

  const csv = await generators[type]();

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${type}-report-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
