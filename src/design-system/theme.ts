import type { RoleSlug } from "@/server/auth/types";

export const roleThemePreference: Record<RoleSlug, "light" | "dark"> = {
  client: "light",
  counsellor: "dark",
  employer: "light",
  admin: "dark",
};
