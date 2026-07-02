import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CourseMaterialEditor } from "@/components/admin/CourseMaterialEditor";

const saveNote = vi.fn();

describe("CourseMaterialEditor", () => {
  it("renders a live markdown preview for the selected day and age group", () => {
    render(
      <CourseMaterialEditor
        locale="en"
        notes={[
          {
            ageGroup: "younger",
            dayNumber: 1,
            markdown: "# Younger day one\n\n- Start simple",
            updatedAt: null,
          },
          {
            ageGroup: "older",
            dayNumber: 1,
            markdown: "# Older day one\n\n- Go deeper",
            updatedAt: null,
          },
        ]}
        saveNote={saveNote}
      />,
    );

    expect(screen.getByRole("heading", { name: "Younger day one" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Ages 12-18" }));

    expect(screen.getByRole("heading", { name: "Older day one" })).toBeInTheDocument();
    expect(screen.getByDisplayValue(/# Older day one/)).toBeInTheDocument();
  });
});
