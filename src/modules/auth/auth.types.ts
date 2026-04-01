import type { UserRole } from "@prisma/client";

export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: string;
}

