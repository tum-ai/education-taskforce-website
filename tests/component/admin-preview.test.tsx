import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdminPreview } from "@/components/dev/AdminPreview";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dev/admin-preview",
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

describe("AdminPreview", () => {
  it("renders fixture-backed admin sections without Supabase configuration", () => {
    render(<AdminPreview />);

    expect(screen.getByRole("heading", { name: "Admin preview" })).toBeInTheDocument();
    expect(within(screen.getByLabelText("Admin summary")).getByText("participant accounts")).toBeInTheDocument();
    expect(within(screen.getByLabelText("Admin summary")).getByText("recent uploads")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Accounts" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Accounts" }));
    expect(screen.getByRole("heading", { name: "Create participant" })).toBeInTheDocument();
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Uploads" }));
    expect(screen.getByRole("heading", { name: "Add an outcome" })).toBeInTheDocument();
    expect(screen.getByText("AI storyboard")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Course material" }));
    expect(screen.getByRole("heading", { name: "Rendered notes" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "QR tools" }));
    expect(screen.getByRole("heading", { name: "AI Debate web app" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Langdock QR supplier." })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Lovable QR supplier." })).toBeInTheDocument();
  });
});
