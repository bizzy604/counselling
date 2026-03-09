export const roles = ["CLIENT", "COUNSELLOR", "EMPLOYER", "ADMIN"] as const;
export type Role = (typeof roles)[number];

export const roleSlugs = ["client", "counsellor", "employer", "admin"] as const;
export type RoleSlug = (typeof roleSlugs)[number];

export type SessionUser = {
  id: string;
  firstName: string;
  lastName: string;
  role: Role;
  department: string;
  email: string;
  phone: string;
  employerName: string;
};

export type AuthSession = {
  id: string;
  createdAt: string;
  expiresAt: string;
  refreshTokenId: string;
  user: SessionUser;
};

export type SessionClaims = {
  sessionId: string;
  sub: string;
  role: Role;
};

export type RefreshClaims = SessionClaims & {
  refreshTokenId: string;
};
