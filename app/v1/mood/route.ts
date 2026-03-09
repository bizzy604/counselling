import { getRequestSession } from "@/server/auth/session";
import { listMoodEntries } from "@/server/mood/service";
import { ok, failure } from "@/server/v1/response";

export async function GET(request: Request) {
  const session = await getRequestSession(request);

  if (!session || session.user.role !== "CLIENT") {
    return failure("UNAUTHORIZED", "Authentication required.", 401);
  }

  const url = new URL(request.url);
  const days = Math.min(Number(url.searchParams.get("days") ?? "30"), 365);

  const entries = await listMoodEntries(session.user, days);
  return ok(entries);
}
