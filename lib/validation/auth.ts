import { z } from "zod";

export const INTERNAL_EMAIL_DOMAIN = "internal.education-taskforce.local";

const usernamePattern = /^[a-z0-9][a-z0-9._-]{1,62}[a-z0-9]$/;

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

export function isValidUsername(username: string): boolean {
  return usernamePattern.test(normalizeUsername(username));
}

export function usernameToInternalEmail(username: string): string {
  const normalized = normalizeUsername(username);

  if (!isValidUsername(normalized)) {
    throw new Error("Use 3 to 64 lowercase letters, numbers, dots, underscores, or hyphens.");
  }

  return `${normalized}@${INTERNAL_EMAIL_DOMAIN}`;
}

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Enter your username.")
    .transform(normalizeUsername)
    .refine(isValidUsername, "Enter a valid username."),
  password: z.string().min(1, "Enter your password."),
});

export const participantAccountSchema = z.object({
  username: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? normalizeUsername(value) : ""))
    .refine((value) => value.length === 0 || isValidUsername(value), "Enter a valid username."),
  displayName: z.string().trim().min(2, "Enter a display name."),
});
