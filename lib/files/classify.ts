import { DANGEROUS_EXTENSIONS } from "@/lib/files/constants";
import type { UploadFileType } from "@/lib/domain/types";

const IMAGE_EXTENSIONS = new Set(["apng", "avif", "gif", "jpeg", "jpg", "png", "svg", "webp"]);
const HTML_EXTENSIONS = new Set(["htm", "html"]);
const PDF_EXTENSIONS = new Set(["pdf"]);
const DOCUMENT_EXTENSIONS = new Set(["doc", "docx", "odt", "pages", "rtf", "txt"]);

export type FileLike = {
  name: string;
  type?: string;
  size?: number;
};

export function getFileExtension(filename: string): string {
  const cleanName = filename.trim().toLowerCase();
  const lastDot = cleanName.lastIndexOf(".");

  if (lastDot < 0 || lastDot === cleanName.length - 1) {
    return "";
  }

  return cleanName.slice(lastDot + 1);
}

export function isDangerousExtension(filename: string): boolean {
  const extension = getFileExtension(filename);
  return extension.length > 0 && DANGEROUS_EXTENSIONS.has(extension);
}

export function classifyUploadFile(file: FileLike): UploadFileType {
  const mimeType = file.type?.toLowerCase() ?? "";
  const extension = getFileExtension(file.name);

  if (mimeType.startsWith("image/") || IMAGE_EXTENSIONS.has(extension)) {
    return "image";
  }

  if (mimeType === "text/html" || HTML_EXTENSIONS.has(extension)) {
    return "html";
  }

  if (mimeType === "application/pdf" || PDF_EXTENSIONS.has(extension)) {
    return "pdf";
  }

  if (
    mimeType.includes("wordprocessingml") ||
    mimeType === "application/msword" ||
    mimeType === "text/plain" ||
    DOCUMENT_EXTENSIONS.has(extension)
  ) {
    return "document";
  }

  return "other";
}
