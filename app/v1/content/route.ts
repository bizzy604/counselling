import type { NextRequest } from "next/server";

import { publishedContent } from "@/lib/demo-data";
import { requireApiSession } from "@/server/auth/api";
import { ok } from "@/server/v1/response";

export async function GET(request: NextRequest) {
  const auth = await requireApiSession(request, ["CLIENT", "COUNSELLOR", "ADMIN"]);

  if (!auth.ok) {
    return auth.response;
  }

  return ok({
    items: publishedContent,
  });
}
