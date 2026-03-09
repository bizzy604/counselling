import type { NextRequest } from "next/server";

import { requireApiSession } from "@/server/auth/api";
import { listRequestsForUser } from "@/server/scheduling/service";
import { failure, ok } from "@/server/v1/response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiSession(request, ["CLIENT", "ADMIN"]);

  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await params;
  const requestItem = (await listRequestsForUser(auth.user)).find(
    (item) => item.id === id,
  );

  if (!requestItem) {
    return failure("NOT_FOUND", "Counselling request not found.", 404);
  }

  return ok({
    item: requestItem,
  });
}
