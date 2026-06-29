import { NextResponse } from "next/server";
import { getCurrentAccount } from "@/lib/auth/current-account";
import { getUploadById } from "@/lib/data/uploads";
import { downloadPrivateFile } from "@/lib/storage/uploads";

type PreviewRouteContext = {
  params: Promise<{
    uploadId: string;
  }>;
};

export async function GET(_request: Request, context: PreviewRouteContext) {
  const account = await getCurrentAccount();

  if (!account) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { uploadId } = await context.params;
  const upload = await getUploadById(uploadId);

  if (!upload || upload.fileType !== "html" || (account.role !== "admin" && upload.accountId !== account.id)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const file = await downloadPrivateFile(upload.storagePath);
  const html = await file.text();

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": "sandbox allow-scripts",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, max-age=60",
    },
  });
}
