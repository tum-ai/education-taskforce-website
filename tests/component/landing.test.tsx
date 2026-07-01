import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgramPreview } from "@/components/landing/ProgramPreview";

describe("ProgramPreview", () => {
  it("renders exactly five day previews", () => {
    render(<ProgramPreview locale="en" />);

    expect(screen.getByRole("heading", { name: /ages 8-18/i })).toBeInTheDocument();
    expect(screen.getAllByText(/^Day \d$/)).toHaveLength(5);
  });
});
