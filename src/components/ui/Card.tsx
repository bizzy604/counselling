import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  title?: string;
  eyebrow?: string;
  aside?: ReactNode;
};

export function Card({
  aside,
  children,
  className,
  eyebrow,
  title,
  ...props
}: CardProps) {
  return (
    <section className={cn("card", className)} {...props}>
      {(title || eyebrow || aside) && (
        <header className="mb-5 flex items-start justify-between gap-4">
          <div className="space-y-1">
            {eyebrow ? (
              <p className="text-overline text-[var(--text-tertiary)]">{eyebrow}</p>
            ) : null}
            {title ? <h2 className="text-h4 text-[var(--text-primary)]">{title}</h2> : null}
          </div>
          {aside}
        </header>
      )}
      {children}
    </section>
  );
}
