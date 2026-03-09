import { BookOpen } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { requireRole } from "@/server/auth/session";
import { listPublishedContent } from "@/server/content/service";
import { listCounsellorClients } from "@/server/notes/service";
import { ContentAssignButton } from "./ContentAssignButton";

export default async function CounsellorContentPage() {
  const user = await requireRole("COUNSELLOR");
  const [libraryItems, clients] = await Promise.all([
    listPublishedContent(),
    listCounsellorClients(user.id),
  ]);

  return (
    <>
      <header className="mb-2">
        <h1 className="text-h2 text-[var(--text-primary)]">Content Assignment</h1>
        <p className="text-body mt-1 text-[var(--text-secondary)]">
          Assign wellness content and programmes to your clients.
        </p>
      </header>

      <Card
        aside={<BookOpen aria-hidden className="text-[var(--text-secondary)]" size={18} />}
        title="Content library"
      >
        {libraryItems.length === 0 ? (
          <p className="py-6 text-center text-[var(--text-tertiary)]">
            No content available yet.
          </p>
        ) : (
          <div className="space-y-3">
            {libraryItems.map((item) => (
              <div
                className="flex items-center justify-between rounded-[var(--radius-lg)] border border-[var(--border-subtle)] p-4"
                key={item.id}
              >
                <div>
                  <p className="text-label text-[var(--text-primary)]">{item.title}</p>
                  <p className="text-body-sm mt-1 text-[var(--text-tertiary)]">{item.category}</p>
                </div>
                <ContentAssignButton clients={clients} contentId={item.id} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
