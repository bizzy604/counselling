import type { NextRequest } from "next/server";

import { requireApiSession } from "@/server/auth/api";
import { listReferralsForUser } from "@/server/referrals/service";
import { failure, ok } from "@/server/v1/response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiSession(request, ["EMPLOYER", "ADMIN"]);

  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await params;
  const referral = (await listReferralsForUser(auth.user)).find((item) => item.id === id);

  if (!referral) {
    return failure("NOT_FOUND", "Referral not found.", 404);
  }

  return ok({
    item: referral,
  });
}
