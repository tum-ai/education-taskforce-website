import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageToggle } from "@/components/layout/LanguageToggle";

const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh,
  }),
}));

describe("LanguageToggle", () => {
  beforeEach(() => {
    refresh.mockClear();
    document.cookie = "site_locale=; Max-Age=0; path=/";
  });

  it("marks the active language and stores the next locale", async () => {
    render(<LanguageToggle locale="en" labels={{ english: "English", german: "German" }} />);

    const german = screen.getByRole("button", { name: "German" });
    expect(screen.getByRole("button", { name: "English" })).toHaveAttribute("aria-pressed", "true");
    expect(german).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(german);

    expect(document.cookie).toContain("site_locale=de");
    expect(refresh).toHaveBeenCalledTimes(1);
  });
});
