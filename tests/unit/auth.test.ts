import { describe, expect, it } from "vitest";
import { createLoginQrPayload } from "@/lib/qr/payload";
import { isValidUsername, normalizeUsername, usernameToInternalEmail } from "@/lib/validation/auth";

describe("auth helpers", () => {
  it("normalizes username input", () => {
    expect(normalizeUsername("  AI-Family_1 ")).toBe("ai-family_1");
  });

  it("maps valid usernames to internal emails", () => {
    expect(usernameToInternalEmail("family.one")).toBe("family.one@internal.education-taskforce.local");
  });

  it("rejects unsafe usernames before email mapping", () => {
    expect(isValidUsername("ab")).toBe(false);
    expect(isValidUsername("person+tag")).toBe(false);
    expect(isValidUsername(".family")).toBe(false);
    expect(() => usernameToInternalEmail("person@example.com")).toThrow();
  });

  it("creates QR login payloads with username only", () => {
    const payload = createLoginQrPayload("Family.One", "https://course.example");

    expect(payload).toBe("https://course.example/login?u=family.one");
    expect(payload).not.toContain("password");
  });
});
