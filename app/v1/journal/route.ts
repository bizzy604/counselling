import { getRequestSession } from "@/server/auth/session";
import { listJournalEntries } from "@/server/journal/service";
import { ok, failure } from "@/server/v1/response";

export async function GET(request: Request) {
  const session = await getRequestSession(request);

  if (!session || session.user.role !== "CLIENT") {
    return failure("UNAUTHORIZED", "Authentication required.", 401);
  }

  const entries = await listJournalEntries(session.user);
  return ok(entries);
}
