import { describe, expect, it } from "vitest";
import {
  DEFAULT_LANGDOCK_LOGIN_URL,
  normalizeLangdockLoginUrl,
  parseLangdockCredentialsCsv,
} from "@/lib/domain/langdock";
import { createLangdockQrPayload } from "@/lib/qr/payload";

describe("Langdock credential helpers", () => {
  it("parses valid Langdock credential CSV rows", () => {
    const result = parseLangdockCredentialsCsv(
      `label,email,password,group,device
Ada,ADA@example.com,"pass,word",Blue,iPad 1`,
    );

    expect(result.errors).toEqual([]);
    expect(result.credentials).toEqual([
      {
        label: "Ada",
        email: "ada@example.com",
        password: "pass,word",
        group: "Blue",
        device: "iPad 1",
        loginUrl: DEFAULT_LANGDOCK_LOGIN_URL,
      },
    ]);
  });

  it("rejects unsupported headers", () => {
    const result = parseLangdockCredentialsCsv(`label,email,password,notes
Ada,ada@example.com,secret,`);

    expect(result.credentials).toEqual([]);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ row: 1, field: "notes" }),
      ]),
    );
  });

  it("rejects missing passwords and duplicate emails", () => {
    const result = parseLangdockCredentialsCsv(`label,email,password
Ada,ada@example.com,
Ben,ada@example.com,secret`);

    expect(result.credentials).toEqual([]);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ row: 2, field: "password" }),
        expect.objectContaining({ row: 3, field: "email" }),
      ]),
    );
  });

  it("rejects CSV files without credential rows", () => {
    const result = parseLangdockCredentialsCsv("label,email,password\n");

    expect(result.credentials).toEqual([]);
    expect(result.errors).toEqual([expect.objectContaining({ row: 2, field: "csv" })]);
  });

  it("normalizes only http and https Langdock URLs without credentials", () => {
    expect(normalizeLangdockLoginUrl("https://app.langdock.com")).toBe("https://app.langdock.com/");
    expect(normalizeLangdockLoginUrl("ftp://app.langdock.com")).toBeNull();
    expect(normalizeLangdockLoginUrl("https://user:pass@app.langdock.com")).toBeNull();
  });

  it("creates hosted QR payloads without embedding Langdock credentials", () => {
    const payload = createLangdockQrPayload("v1.token.signature", "https://course.example/admin");

    expect(payload).toBe("https://course.example/k/v1.token.signature");
    expect(payload).not.toContain("password");
    expect(payload).not.toContain("ada@example.com");
  });
});
