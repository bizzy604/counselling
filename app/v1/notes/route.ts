import { getRequestSession } from "@/server/auth/session";
import { listSessionNotes } from "@/server/notes/service";
import { ok, failure } from "@/server/v1/response";

export async function GET(request: Request) {
  const session = await getRequestSession(request);

  if (!session || session.user.role !== "COUNSELLOR") {
    return failure("UNAUTHORIZED", "Authentication required.", 401);
  }

  const notes = await listSessionNotes(session.user);
  return ok(notes);
}
