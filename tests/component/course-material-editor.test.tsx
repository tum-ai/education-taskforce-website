import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CourseMaterialEditor } from "@/components/admin/CourseMaterialEditor";

const saveNote = vi.fn();

describe("CourseMaterialEditor", () => {
  it("opens in read mode with a large rendered preview", () => {
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
    expect(screen.queryByRole("textbox", { name: "Markdown" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "View" })).toHaveAttribute("aria-pressed", "true");
  });

  it("shows the editable split preview after clicking edit", () => {
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

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    fireEvent.click(screen.getByRole("button", { name: "Ages 12-18" }));

    expect(screen.getByRole("heading", { name: "Older day one" })).toBeInTheDocument();
    expect(screen.getByDisplayValue(/# Older day one/)).toBeInTheDocument();
  });

  it("highlights the preview block near the markdown cursor", () => {
    const markdown = "# Younger day one\n\nIntro\n\n- Start simple\n- Keep moving";
    render(
      <CourseMaterialEditor
        locale="en"
        notes={[
          {
            ageGroup: "younger",
            dayNumber: 1,
            markdown,
            updatedAt: null,
          },
        ]}
        saveNote={saveNote}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    const textarea = screen.getByRole("textbox", { name: "Markdown" }) as HTMLTextAreaElement;
    const cursorPosition = markdown.indexOf("Keep moving");
    textarea.setSelectionRange(cursorPosition, cursorPosition);
    fireEvent.select(textarea);

    expect(screen.getByText("Keep moving").closest("ul")).toHaveClass("markdown-active-block");
  });
});
