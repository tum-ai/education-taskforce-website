import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { PARTICIPANT_UPLOADS_BUCKET } from "@/lib/storage/paths";

export async function createSignedUploadToken(storagePath: string): Promise<string> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.storage.from(PARTICIPANT_UPLOADS_BUCKET).createSignedUploadUrl(storagePath);

  if (error || !data?.token) {
    throw new Error("Could not prepare the upload.");
  }

  return data.token;
}

export async function getPrivateFileInfo(storagePath: string): Promise<{ size: number; contentType: string } | null> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.storage.from(PARTICIPANT_UPLOADS_BUCKET).info(storagePath);

  // Fail closed if the size is missing: the caller re-validates the object against
  // the upload limit, and coercing an absent size to 0 would silently pass that check.
  if (error || !data || typeof data.size !== "number") {
    return null;
  }

  return { size: data.size, contentType: data.contentType ?? "" };
}

export async function downloadPrivateFile(storagePath: string): Promise<Blob> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.storage.from(PARTICIPANT_UPLOADS_BUCKET).download(storagePath);

  if (error || !data) {
    throw new Error("Could not download the file.");
  }

  return data;
}

export async function deletePrivateFile(storagePath: string): Promise<void> {
  const admin = createSupabaseAdminClient();
  const { error } = await admin.storage.from(PARTICIPANT_UPLOADS_BUCKET).remove([storagePath]);

  if (error) {
    throw new Error("Could not delete the file.");
  }
}
