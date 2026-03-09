import { ok } from "@/server/v1/response";

export async function GET() {
  return ok({
    service: "cwe-platform",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
