import type { HTMLAttributes } from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeStyles = cva("badge", {
  variants: {
    variant: {
      active: "badge-active",
      pending: "badge-pending",
      crisis: "badge-crisis",
      inactive: "badge-inactive",
      complete: "badge-complete",
    },
  },
  defaultVariants: {
    variant: "active",
  },
});

type BadgeProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeStyles>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeStyles({ variant }), className)} {...props} />;
}
