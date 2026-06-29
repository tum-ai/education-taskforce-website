export const USER_ROLES = ["admin", "participant"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const DAY_NUMBERS = [1, 2, 3, 4, 5] as const;
export type DayNumber = (typeof DAY_NUMBERS)[number];

export const UPLOAD_FILE_TYPES = ["image", "html", "pdf", "document", "other"] as const;
export type UploadFileType = (typeof UPLOAD_FILE_TYPES)[number];

export type Account = {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  createdAt?: string;
};

export type DayUpload = {
  id: string;
  accountId: string;
  dayNumber: DayNumber;
  title: string;
  fileType: UploadFileType;
  storagePath: string;
  originalFilename: string;
  contentType: string;
  fileSizeBytes: number;
  createdAt: string;
};

export type DayBucket = {
  dayNumber: DayNumber;
  title: string;
  description: string;
  uploads: DayUpload[];
};
