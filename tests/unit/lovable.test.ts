import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOVABLE_LOGIN_URL,
  normalizeLovableLoginUrl,
  parseLovableCredentialsCsv,
} from "@/lib/domain/lovable";

describe("Lovable credential helpers", () => {
  it("parses valid Lovable credential CSV rows with the Lovable default URL", () => {
    const result = parseLovableCredentialsCsv(`label,email,password,group,device
Ada,ADA@example.com,example-password,Blue,iPad 1`);

    expect(result.errors).toEqual([]);
    expect(result.credentials).toEqual([
      {
        label: "Ada",
        email: "ada@example.com",
        password: "example-password",
        group: "Blue",
        device: "iPad 1",
        loginUrl: DEFAULT_LOVABLE_LOGIN_URL,
      },
    ]);
  });

  it("normalizes only http and https Lovable URLs without credentials", () => {
    expect(normalizeLovableLoginUrl("https://lovable.dev")).toBe("https://lovable.dev/");
    expect(normalizeLovableLoginUrl("ftp://lovable.dev")).toBeNull();
    expect(normalizeLovableLoginUrl("https://user:pass@lovable.dev")).toBeNull();
  });
});
