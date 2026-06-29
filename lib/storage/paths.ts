import type { DayNumber } from "@/lib/domain/types";
import { sanitizeFilename } from "@/lib/files/filenames";

export const PARTICIPANT_UPLOADS_BUCKET = "participant-uploads";

export function createUploadStoragePath({
  accountId,
  dayNumber,
  uploadId,
  filename,
}: {
  accountId: string;
  dayNumber: DayNumber;
  uploadId: string;
  filename: string;
}) {
  return `accounts/${accountId}/day-${dayNumber}/${uploadId}-${sanitizeFilename(filename)}`;
}
