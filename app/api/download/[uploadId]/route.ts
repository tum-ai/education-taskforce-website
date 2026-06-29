import { NextResponse } from "next/server";
import { getCurrentAccount } from "@/lib/auth/current-account";
import { contentDispositionAttachment, sanitizeFilename } from "@/lib/files/filenames";
import { getUploadById } from "@/lib/data/uploads";
import { downloadPrivateFile } from "@/lib/storage/uploads";

type DownloadRouteContext = {
  params: Promise<{
    uploadId: string;
  }>;
};

export async function GET(request: Request, context: DownloadRouteContext) {
  const account = await getCurrentAccount();

  if (!account) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { uploadId } = await context.params;
  const upload = await getUploadById(uploadId);

  if (!upload || (account.role !== "admin" && upload.accountId !== account.id)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const file = await downloadPrivateFile(upload.storagePath);
  const url = new URL(request.url);
  const preview = url.searchParams.get("preview") === "1" && upload.fileType === "image";
  const headers = new Headers({
    "Content-Type": upload.contentType || "application/octet-stream",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "private, max-age=60",
    "Content-Disposition": preview
      ? `inline; filename="${sanitizeFilename(upload.originalFilename)}"`
      : contentDispositionAttachment(upload.originalFilename),
  });

  return new NextResponse(file, {
    status: 200,
    headers,
  });
}
