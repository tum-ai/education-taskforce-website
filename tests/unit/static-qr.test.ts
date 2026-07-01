import { describe, expect, it } from "vitest";
import { createStaticQrPayload } from "@/lib/qr/payload";

describe("static QR helpers", () => {
  it("keeps absolute http and https target URLs unchanged", () => {
    expect(createStaticQrPayload("https://ai-debate-production-3d7d.up.railway.app/")).toBe(
      "https://ai-debate-production-3d7d.up.railway.app/",
    );
    expect(createStaticQrPayload("https://project-firewall-production.up.railway.app/")).toBe(
      "https://project-firewall-production.up.railway.app/",
    );
  });

  it("rejects unsafe target URLs", () => {
    expect(() => createStaticQrPayload("javascript:alert(1)")).toThrow("Static QR target must use http or https.");
  });
});
