export const ACCESS_TOKEN_COOKIE = "cwe-access-token";
export const REFRESH_TOKEN_COOKIE = "cwe-refresh-token";

export const AUTH_AUDIENCE = "cwe-platform";
export const AUTH_ISSUER = "cwe-platform";

const accessTtlMinutes = Number(process.env.AUTH_ACCESS_TTL_MINUTES ?? 30);
const refreshTtlHours = Number(process.env.AUTH_REFRESH_TTL_HOURS ?? 12);

export const ACCESS_TOKEN_TTL_SECONDS = accessTtlMinutes * 60;
export const REFRESH_TOKEN_TTL_SECONDS = refreshTtlHours * 60 * 60;

export const COOKIE_BASE_OPTIONS = {
  httpOnly: true,
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};
