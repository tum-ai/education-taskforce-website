import "server-only";

import { randomUUID } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mapDayUpload } from "@/lib/supabase/mapper";
import type { DayNumber, DayUpload, UploadFileType } from "@/lib/domain/types";

type CreateUploadRecordInput = {
  id?: string;
  accountId: string;
  dayNumber: DayNumber;
  title: string;
  fileType: UploadFileType;
  storagePath: string;
  originalFilename: string;
  contentType: string;
  fileSizeBytes: number;
};

export function createUploadId(): string {
  return randomUUID();
}

export async function listUploadsForAccount(accountId: string): Promise<DayUpload[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("day_uploads")
    .select("*")
    .eq("account_id", accountId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Could not load uploads.");
  }

  return (data ?? []).map(mapDayUpload);
}

export async function listUploadsForDay(accountId: string, dayNumber: DayNumber): Promise<DayUpload[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("day_uploads")
    .select("*")
    .eq("account_id", accountId)
    .eq("day_number", dayNumber)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Could not load day uploads.");
  }

  return (data ?? []).map(mapDayUpload);
}

export async function getUploadById(uploadId: string): Promise<DayUpload | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("day_uploads").select("*").eq("id", uploadId).maybeSingle();

  if (error) {
    throw new Error("Could not load upload.");
  }

  return data ? mapDayUpload(data) : null;
}

export async function createUploadRecord(input: CreateUploadRecordInput): Promise<DayUpload> {
  const admin = createSupabaseAdminClient();
  const id = input.id ?? createUploadId();
  const { data, error } = await admin
    .from("day_uploads")
    .insert({
      id,
      account_id: input.accountId,
      day_number: input.dayNumber,
      title: input.title,
      file_type: input.fileType,
      storage_path: input.storagePath,
      original_filename: input.originalFilename,
      content_type: input.contentType,
      file_size_bytes: input.fileSizeBytes,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error("Could not save upload metadata.");
  }

  return mapDayUpload(data);
}

export async function listRecentUploads(limit = 8): Promise<DayUpload[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("day_uploads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error("Could not load recent uploads.");
  }

  return (data ?? []).map(mapDayUpload);
}
