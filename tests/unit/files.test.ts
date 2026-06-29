import { describe, expect, it } from "vitest";
import { classifyUploadFile, isDangerousExtension } from "@/lib/files/classify";
import { contentDispositionAttachment, sanitizeFilename } from "@/lib/files/filenames";
import { validateUploadFile } from "@/lib/validation/uploads";

describe("file handling", () => {
  it("classifies images, HTML, PDFs, documents, and unknown files", () => {
    expect(classifyUploadFile({ name: "photo.png", type: "image/png" })).toBe("image");
    expect(classifyUploadFile({ name: "project.html", type: "text/html" })).toBe("html");
    expect(classifyUploadFile({ name: "slides.pdf", type: "application/pdf" })).toBe("pdf");
    expect(
      classifyUploadFile({
        name: "notes.docx",
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      }),
    ).toBe("document");
    expect(classifyUploadFile({ name: "archive.zip", type: "application/zip" })).toBe("other");
  });

  it("rejects dangerous executable extensions", () => {
    expect(isDangerousExtension("malware.exe")).toBe(true);
    expect(isDangerousExtension("script.sh")).toBe(true);
    expect(validateUploadFile({ name: "script.sh", size: 200, type: "text/plain" })).toBe(
      "This file type is not allowed.",
    );
  });

  it("validates missing and oversized uploads", () => {
    expect(validateUploadFile(null)).toBe("Choose one file to upload.");
    expect(validateUploadFile({ name: "big.pdf", size: 51 * 1024 * 1024, type: "application/pdf" })).toBe(
      "Choose a file up to 50 MB.",
    );
  });

  it("sanitizes download filenames", () => {
    expect(sanitizeFilename("../../My Final Project!!.html")).toBe("My-Final-Project.html");
    expect(contentDispositionAttachment("../../My Final Project!!.html")).toBe(
      'attachment; filename="My-Final-Project.html"',
    );
  });
});
