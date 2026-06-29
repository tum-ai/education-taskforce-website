import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { PARTICIPANT_UPLOADS_BUCKET } from "@/lib/storage/paths";

export async function uploadPrivateFile(storagePath: string, file: File) {
  const admin = createSupabaseAdminClient();
  const { error } = await admin.storage.from(PARTICIPANT_UPLOADS_BUCKET).upload(storagePath, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (error) {
    throw new Error("Could not upload the file.");
  }
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
