import { BookOpen, Search } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { requireRole } from "@/server/auth/session";
import { listPublishedContent, listContentCategories } from "@/server/content/service";

export default async function ContentLibraryPage() {
  await requireRole("CLIENT");
  const [categories, featured] = await Promise.all([
    listContentCategories(),
    listPublishedContent(),
  ]);

  return (
    <>
      <header className="mb-2">
        <h1 className="text-h2 text-[var(--text-primary)]">Content Library</h1>
        <p className="text-body mt-1 text-[var(--text-secondary)]">
          Browse wellness resources, articles, and guided programmes.
        </p>
      </header>

      <Card>
        <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] px-4 py-3">
          <Search aria-hidden className="text-[var(--text-tertiary)]" size={18} />
          <input
            className="flex-1 bg-transparent text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)]"
            placeholder="Search articles, programmes…"
            type="search"
          />
        </div>
      </Card>

      {categories.length > 0 && (
        <Card
          aside={<BookOpen aria-hidden className="text-[var(--text-secondary)]" size={18} />}
          title="Categories"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <div
                className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] p-4 transition-colors hover:border-[var(--border-default)]"
                key={cat.label}
              >
                <div>
                  <p className="text-label text-[var(--text-primary)]">{cat.label}</p>
                  <p className="text-body-sm text-[var(--text-tertiary)]">{cat.count} resources</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card title="Available content">
        {featured.length === 0 ? (
          <p className="py-6 text-center text-[var(--text-tertiary)]">
            No content available yet. Check back soon.
          </p>
        ) : (
          <div className="space-y-3">
            {featured.map((item) => (
              <div
                className="flex items-center justify-between rounded-[var(--radius-lg)] border border-[var(--border-subtle)] p-4 transition-colors hover:bg-[var(--bg-surface-raised)]"
                key={item.id}
              >
                <div>
                  <p className="text-label text-[var(--text-primary)]">{item.title}</p>
                  <p className="text-body-sm mt-1 text-[var(--text-tertiary)]">
                    {item.category}{item.duration ? ` · ${item.duration}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}
