"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/current-account";
import { createUploadId, createUploadRecord } from "@/lib/data/uploads";
import { classifyUploadFile } from "@/lib/files/classify";
import { deletePrivateFile, uploadPrivateFile } from "@/lib/storage/uploads";
import { createUploadStoragePath } from "@/lib/storage/paths";
import { LOCALE_COOKIE, normalizeLocale, translate } from "@/lib/i18n/translations";
import { uploadMetadataSchema, validateUploadFile } from "@/lib/validation/uploads";
import type { DayNumber } from "@/lib/domain/types";

export type UploadActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

export async function uploadOutcomeFormAction(
  _previousState: UploadActionState,
  formData: FormData,
): Promise<UploadActionState> {
  await requireAdmin();
  const locale = normalizeLocale(formData.get(LOCALE_COOKIE));

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return {
      status: "error",
      fieldErrors: {
        file: translate(locale, "admin.chooseFile"),
      },
    };
  }

  const fileError = validateUploadFile(file);
  const parsed = uploadMetadataSchema.safeParse({
    accountId: formData.get("accountId"),
    dayNumber: formData.get("dayNumber"),
    title: formData.get("title"),
  });

  if (!parsed.success || fileError) {
    return {
      status: "error",
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

  const uploadId = createUploadId();
  const dayNumber = parsed.data.dayNumber as DayNumber;
  const fileType = classifyUploadFile(file);
  const storagePath = createUploadStoragePath({
    accountId: parsed.data.accountId,
    dayNumber,
    uploadId,
    filename: file.name,
  });

  try {
    await uploadPrivateFile(storagePath, file);
    await createUploadRecord({
      id: uploadId,
      accountId: parsed.data.accountId,
      dayNumber,
      title: parsed.data.title,
      fileType,
      storagePath,
      originalFilename: file.name,
      contentType: file.type || "application/octet-stream",
      fileSizeBytes: file.size,
    });
  } catch (error) {
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
