import { USER_ROLES, type UserRole } from "@/lib/domain/types";

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && USER_ROLES.includes(value as UserRole);
}

export function assertUserRole(value: unknown): UserRole {
  if (!isUserRole(value)) {
    throw new Error("Unsupported account role.");
  }

  return value;
}
