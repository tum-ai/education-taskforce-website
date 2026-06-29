import { z } from "zod";
import { DAY_NUMBERS, type DayNumber } from "@/lib/domain/types";
import { MAX_UPLOAD_BYTES } from "@/lib/files/constants";
import { isDangerousExtension, type FileLike } from "@/lib/files/classify";

export const uploadMetadataSchema = z.object({
  accountId: z.string().uuid("Choose a participant account."),
  dayNumber: z.coerce
    .number()
    .int()
    .refine((value) => DAY_NUMBERS.includes(value as DayNumber), "Choose Day 1 through Day 5."),
  title: z.string().trim().min(1, "Enter a title."),
});

export function validateUploadFile(file: FileLike | null | undefined): string | null {
  if (!file || !file.name) {
    return "Choose one file to upload.";
  }

  if (typeof file.size === "number" && file.size > MAX_UPLOAD_BYTES) {
    return "Choose a file up to 50 MB.";
  }

  if (isDangerousExtension(file.name)) {
    return "This file type is not allowed.";
  }

  return null;
}
