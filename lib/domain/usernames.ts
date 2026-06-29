import { isValidUsername, normalizeUsername } from "@/lib/validation/auth";

export function slugifyUsernameSeed(value: string): string {
  const normalized = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/[-_.]{2,}/g, "-")
    .replace(/^[-_.]+|[-_.]+$/g, "")
    .slice(0, 42);

  return normalized || "participant";
}

export function buildParticipantUsername(displayName: string, suffix: string): string {
  const seed = slugifyUsernameSeed(displayName);
  const normalized = normalizeUsername(`${seed}-${suffix}`);

  if (isValidUsername(normalized)) {
    return normalized;
  }

  return `participant-${suffix}`;
}
