import { cn } from "@/lib/utils";

type NoticeProps = {
  children: React.ReactNode;
  tone?: "error" | "success";
};

export function Notice({ children, tone = "success" }: NoticeProps) {
  return (
    <div
      className={cn(
        "rounded-[20px] border px-4 py-3 text-body-sm",
        tone === "error"
          ? "border-[color:color-mix(in_srgb,var(--danger)_30%,transparent)] bg-[color:color-mix(in_srgb,var(--danger)_10%,transparent)] text-[var(--text-danger)]"
          : "border-[color:color-mix(in_srgb,var(--savanna-600)_24%,transparent)] bg-[color:color-mix(in_srgb,var(--savanna-600)_10%,transparent)] text-[var(--text-success)]",
      )}
      role="status"
    >
      {children}
    </div>
  );
}
