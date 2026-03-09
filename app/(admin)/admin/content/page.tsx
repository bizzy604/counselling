import { requireRole } from "@/server/auth/session";
import { listAllContent } from "@/server/content/service";
import { ContentTable } from "./ContentTable";

export default async function AdminContentPage() {
  await requireRole("ADMIN");
  const contentItems = await listAllContent();

  return <ContentTable initialItems={contentItems} />;
}
