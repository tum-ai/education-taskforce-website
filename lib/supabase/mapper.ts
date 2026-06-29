import type { Account, DayNumber, DayUpload, UploadFileType, UserRole } from "@/lib/domain/types";

type AccountRow = {
  id: string;
  username: string;
  display_name: string;
  role: UserRole;
  participant_credentials?:
    | {
        temporary_password: string | null;
      }
    | Array<{
        temporary_password: string | null;
      }>
    | null;
  created_at?: string;
};

type DayUploadRow = {
  id: string;
  account_id: string;
  day_number: DayNumber;
  title: string;
  file_type: UploadFileType;
  storage_path: string;
  original_filename: string;
  content_type: string;
  file_size_bytes: number;
  created_at: string;
};

export function mapAccount(row: AccountRow): Account {
  const credential = Array.isArray(row.participant_credentials)
    ? row.participant_credentials[0]
    : row.participant_credentials;

  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    role: row.role,
    temporaryPassword: credential?.temporary_password ?? null,
    createdAt: row.created_at,
  };
}

export function mapDayUpload(row: DayUploadRow): DayUpload {
  return {
    id: row.id,
    accountId: row.account_id,
    dayNumber: row.day_number,
    title: row.title,
    fileType: row.file_type,
    storagePath: row.storage_path,
    originalFilename: row.original_filename,
    contentType: row.content_type,
    fileSizeBytes: row.file_size_bytes,
    createdAt: row.created_at,
  };
}
