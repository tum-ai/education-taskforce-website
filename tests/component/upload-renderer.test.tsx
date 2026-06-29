import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UploadRenderer } from "@/components/preview/UploadRenderer";
import type { DayUpload } from "@/lib/domain/types";

const htmlUpload: DayUpload = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  accountId: "123e4567-e89b-12d3-a456-426614174001",
  dayNumber: 3,
  title: "Story page",
  fileType: "html",
  storagePath: "accounts/123/day-3/upload-index.html",
  originalFilename: "index.html",
  contentType: "text/html",
  fileSizeBytes: 1200,
  createdAt: "2026-06-29T12:00:00.000Z",
};

describe("UploadRenderer", () => {
  it("renders HTML uploads in a sandboxed iframe", () => {
    render(<UploadRenderer upload={htmlUpload} />);

    const frame = screen.getByTitle("Story page");
    const sandbox = frame.getAttribute("sandbox");

    expect(frame).toHaveAttribute("sandbox", "allow-scripts");
    expect(sandbox).not.toContain("allow-same-origin");
    expect(sandbox).not.toContain("allow-top-navigation");
    expect(screen.getByRole("link", { name: /download source/i })).toHaveAttribute(
      "href",
      "/api/download/123e4567-e89b-12d3-a456-426614174000",
    );
  });
});
