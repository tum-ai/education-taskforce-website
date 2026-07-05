import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppHeader } from "@/components/layout/AppHeader";

vi.mock("@/lib/auth/actions", () => ({
  signOut: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin",
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

describe("AppHeader", () => {
  it("links admins to the QR code hub", () => {
    render(
      <AppHeader
        account={{
          displayName: "Admin",
          id: "admin-id",
          role: "admin",
          username: "admin",
        }}
        locale="en"
      />,
    );

    expect(screen.getAllByRole("link", { name: "QR-Codes" }).map((link) => link.getAttribute("href"))).toEqual([
      "/admin/qr",
      "/admin/qr",
    ]);
    expect(screen.getByLabelText("Account navigation", { selector: "summary" })).toBeInTheDocument();
  });
});
