import type { NextRequest } from "next/server";

import { requireApiSession } from "@/server/auth/api";
import { listAppointmentsForUser } from "@/server/scheduling/service";
import { failure, ok } from "@/server/v1/response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiSession(request, ["CLIENT", "COUNSELLOR", "ADMIN"]);

  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await params;
  const appointment = (await listAppointmentsForUser(auth.user)).find(
    (item) => item.id === id,
  );

  if (!appointment) {
    return failure("NOT_FOUND", "Appointment not found.", 404);
  }

  return ok({
    item: appointment,
  });
}
