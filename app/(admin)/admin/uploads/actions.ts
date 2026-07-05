"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/current-account";
import { createUploadId, createUploadRecord, getUploadById } from "@/lib/data/uploads";
import { classifyUploadFile } from "@/lib/files/classify";
import { createSignedUploadToken, deletePrivateFile, getPrivateFileInfo } from "@/lib/storage/uploads";
import { createUploadStoragePath } from "@/lib/storage/paths";
import { normalizeLocale, translate } from "@/lib/i18n/translations";
import { uploadMetadataSchema, validateUploadFile } from "@/lib/validation/uploads";
import type { DayNumber } from "@/lib/domain/types";

export type UploadActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

export type UploadMetadataInput = {
  locale: string;
  accountId: string;
  dayNumber: string;
  title: string;
  fileName: string;
  fileSize: number;
  fileMimeType: string;
};

export type PrepareUploadResult =
  | { status: "error"; message?: string; fieldErrors?: Record<string, string> }
  | {
      status: "ready";
      uploadId: string;
      storagePath: string;
      uploadToken: string;
    };

// Files go directly from the browser to Supabase Storage via a signed upload
// URL: server-action bodies are capped at 1 MB (and ~4.5 MB on Vercel), so the
// file itself must never travel through an action. `prepareUploadAction`
// validates metadata and issues the signed token; `finalizeUploadAction`
// verifies the uploaded object and records it.

export async function prepareUploadAction(input: UploadMetadataInput): Promise<PrepareUploadResult> {
  await requireAdmin();
  const locale = normalizeLocale(input.locale);

  const validation = validateMetadata(input);
  if (!validation.ok) {
    return { status: "error", fieldErrors: validation.fieldErrors };
  }

  const uploadId = createUploadId();
  const storagePath = createUploadStoragePath({
    accountId: validation.accountId,
    dayNumber: validation.dayNumber,
    uploadId,
    filename: input.fileName,
  });

  try {
    const uploadToken = await createSignedUploadToken(storagePath);
    return { status: "ready", uploadId, storagePath, uploadToken };
  } catch {
    return { status: "error", message: translate(locale, "admin.couldNotUploadFile") };
  }
}

export async function finalizeUploadAction(
  input: UploadMetadataInput & { uploadId: string },
): Promise<UploadActionState> {
  await requireAdmin();
  const locale = normalizeLocale(input.locale);

  const validation = validateMetadata(input);
  if (!validation.ok) {
    return { status: "error", fieldErrors: validation.fieldErrors };
  }

  if (!z.string().uuid().safeParse(input.uploadId).success) {
    return { status: "error", message: translate(locale, "admin.couldNotUploadFile") };
  }

  // Recompute the path instead of trusting a client-provided one, so the
  // record can only ever point at the object issued by prepareUploadAction.
  const storagePath = createUploadStoragePath({
    accountId: validation.accountId,
    dayNumber: validation.dayNumber,
    uploadId: input.uploadId,
    filename: input.fileName,
  });

  const [info, existingUpload] = await Promise.all([
    getPrivateFileInfo(storagePath),
    getUploadById(input.uploadId),
  ]);

  // Re-submitting the same finalize call must not delete the already-recorded object.
  if (existingUpload) {
    return { status: "success", message: translate(locale, "admin.uploadSaved") };
  }

  if (!info) {
    return { status: "error", message: translate(locale, "admin.couldNotUploadFile") };
  }

  const contentType = info.contentType || input.fileMimeType || "application/octet-stream";
  const storedFile = { name: input.fileName, size: info.size, type: contentType };

  // Re-check against the size the object actually has in storage, not the client's claim.
  const storedFileError = validateUploadFile(storedFile);
  if (storedFileError) {
    await deletePrivateFile(storagePath).catch(() => undefined);
    return { status: "error", fieldErrors: { file: storedFileError } };
  }

  try {
    await createUploadRecord({
      id: input.uploadId,
      accountId: validation.accountId,
      dayNumber: validation.dayNumber,
      title: validation.title,
      fileType: classifyUploadFile(storedFile),
      storagePath,
      originalFilename: input.fileName,
      contentType,
      fileSizeBytes: info.size,
    });
  } catch (error) {
    // A concurrent finalize for the same uploadId may have already inserted the row
    // (the existingUpload check above is not atomic with the insert). If a record now
    // exists, that request owns the object — never delete it out from under it.
    if (await getUploadById(input.uploadId)) {
      return { status: "success", message: translate(locale, "admin.uploadSaved") };
    }
    await deletePrivateFile(storagePath).catch(() => undefined);
    return {
      status: "error",
      message: error instanceof Error ? error.message : translate(locale, "admin.couldNotUploadFile"),
    };
  }

  revalidatePath("/admin/uploads");
  revalidatePath("/portal");
  return { status: "success", message: translate(locale, "admin.uploadSaved") };
}

type MetadataValidation =
  | { ok: true; accountId: string; dayNumber: DayNumber; title: string }
  | { ok: false; fieldErrors: Record<string, string> };

function validateMetadata(input: UploadMetadataInput): MetadataValidation {
  const fileError = validateUploadFile({ name: input.fileName, size: input.fileSize, type: input.fileMimeType });
  const parsed = uploadMetadataSchema.safeParse({
    accountId: input.accountId,
    dayNumber: input.dayNumber,
    title: input.title,
  });

  if (!parsed.success || fileError) {
    return {
      ok: false,
      fieldErrors: {
        ...Object.fromEntries(
          Object.entries(parsed.success ? {} : parsed.error.flatten().fieldErrors).map(([key, value]) => [
            key,
            value?.[0] ?? "",
          ]),
        ),
        ...(fileError ? { file: fileError } : {}),
      },
    };
  }

  return {
    ok: true,
    accountId: parsed.data.accountId,
    dayNumber: parsed.data.dayNumber as DayNumber,
    title: parsed.data.title,
  };
}
