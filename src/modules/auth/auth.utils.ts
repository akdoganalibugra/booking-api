import { UserRole } from "@prisma/client";

export const DEFAULT_USER_ROLE = UserRole.CUSTOMER;

export function isAdminRole(role: UserRole): boolean {
  return role === UserRole.ADMIN;
}

