const PARTICIPANT_PREFIXES = ["/portal"];

export const PROTECTED_PREFIXES = [...PARTICIPANT_PREFIXES, "/admin"];

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix));
}

/**
 * Validates a post-login redirect target coming from the untrusted `next` query param.
 * Only same-origin paths inside the protected areas the given role may access pass;
 * everything else (external URLs, protocol-relative `//`, backslash tricks) returns null.
 */
export function sanitizeNextPath(value: unknown, role: "admin" | "participant"): string | null {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return null;
  }

  const pathname = value.split(/[?#]/)[0];

  // Reject dot segments: "/portal/../admin" would pass the participant prefix check
  // yet the browser normalizes it to "/admin", escaping the role's allowed area.
  if (pathname.split("/").some((segment) => segment === "." || segment === "..")) {
    return null;
  }

  const allowedPrefixes = role === "admin" ? PROTECTED_PREFIXES : PARTICIPANT_PREFIXES;

  if (!allowedPrefixes.some((prefix) => matchesPrefix(pathname, prefix))) {
    return null;
  }

  return value;
}
