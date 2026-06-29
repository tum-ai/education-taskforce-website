export function sanitizeFilename(filename: string): string {
  const normalized = filename
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\\/]+/g, "-");
  const lastDot = normalized.lastIndexOf(".");
  const baseName = lastDot > 0 ? normalized.slice(0, lastDot) : normalized;
  const extension = lastDot > 0 ? normalized.slice(lastDot + 1) : "";
  const safeBaseName = baseName
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^[-_.]+|[-_.]+$/g, "")
    .slice(0, 100);
  const safeExtension = extension.replace(/[^a-zA-Z0-9]+/g, "").slice(0, 16);
  const normalizedFilename = `${safeBaseName || "download"}${safeExtension ? `.${safeExtension}` : ""}`;

  return normalizedFilename.slice(0, 120);
}

export function contentDispositionAttachment(filename: string): string {
  return `attachment; filename="${sanitizeFilename(filename)}"`;
}
