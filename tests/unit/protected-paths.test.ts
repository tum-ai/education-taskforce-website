import { describe, expect, it } from "vitest";
import { isProtectedPath, sanitizeNextPath } from "@/lib/auth/protected-paths";

describe("isProtectedPath", () => {
  it("matches protected prefixes and their subpaths", () => {
    expect(isProtectedPath("/portal")).toBe(true);
    expect(isProtectedPath("/portal/day/3")).toBe(true);
    expect(isProtectedPath("/admin/uploads")).toBe(true);
    expect(isProtectedPath("/login")).toBe(false);
    expect(isProtectedPath("/portalx")).toBe(false);
  });
});

describe("sanitizeNextPath", () => {
  it("accepts protected paths for the matching role", () => {
    expect(sanitizeNextPath("/portal/day/3", "participant")).toBe("/portal/day/3");
    expect(sanitizeNextPath("/portal/day/3?tab=uploads", "participant")).toBe("/portal/day/3?tab=uploads");
    expect(sanitizeNextPath("/admin/uploads", "admin")).toBe("/admin/uploads");
    expect(sanitizeNextPath("/portal", "admin")).toBe("/portal");
  });

  it("rejects admin paths for participants", () => {
    expect(sanitizeNextPath("/admin", "participant")).toBeNull();
    expect(sanitizeNextPath("/admin/uploads", "participant")).toBeNull();
  });

  it("rejects off-origin and malformed targets", () => {
    expect(sanitizeNextPath("https://evil.example", "admin")).toBeNull();
    expect(sanitizeNextPath("//evil.example", "admin")).toBeNull();
    expect(sanitizeNextPath("/\\evil.example", "admin")).toBeNull();
    expect(sanitizeNextPath("portal", "participant")).toBeNull();
    expect(sanitizeNextPath("/login", "participant")).toBeNull();
    expect(sanitizeNextPath(null, "participant")).toBeNull();
    expect(sanitizeNextPath(undefined, "admin")).toBeNull();
  });

  it("rejects dot-segment paths that normalize outside the allowed area", () => {
    expect(sanitizeNextPath("/portal/../admin", "participant")).toBeNull();
    expect(sanitizeNextPath("/portal/./day/3", "participant")).toBeNull();
    expect(sanitizeNextPath("/admin/../portal/..", "admin")).toBeNull();
  });
});
