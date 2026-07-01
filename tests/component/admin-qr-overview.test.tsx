import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AdminQrOverview } from "@/components/admin/AdminQrOverview";

describe("AdminQrOverview", () => {
  it("renders the QR destination cards", () => {
    render(<AdminQrOverview locale="en" />);
    const hrefs = screen.getAllByRole("link").map((link) => link.getAttribute("href"));

    expect(screen.getByRole("link", { name: /Langdock QR generator/i })).toHaveAttribute(
      "href",
      "/admin/qr/langdock",
    );
    expect(hrefs).toContain("/admin/qr/ai-debate");
    expect(screen.getByRole("link", { name: /Hacking tool QR/i })).toHaveAttribute(
      "href",
      "/admin/qr/ai-debate-backup",
    );
    expect(screen.getByRole("link", { name: /Lovable QR generator/i })).toHaveAttribute(
      "href",
      "/admin/qr/lovable",
    );
  });
});
