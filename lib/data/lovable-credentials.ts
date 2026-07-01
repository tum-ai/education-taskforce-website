import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  DEFAULT_LOVABLE_LOGIN_URL,
  type LovableCredential,
  type LovableCredentialCard,
  type LovableCredentialInput,
  type LovableImportError,
  parseLovableCredentialsCsv,
} from "@/lib/domain/lovable";
import { createLovableQrDataUrl } from "@/lib/qr/qrcode";
import {
  createLangdockScanNonce,
  createLangdockScanToken,
  verifyLangdockScanToken,
} from "@/lib/langdock/tokens";

type LovableCredentialRow = {
  id: string;
  label: string;
  email: string;
  lovable_password: string;
  group_label: string | null;
  device_label: string | null;
  login_url: string;
  scan_nonce: string;
  created_at: string;
  updated_at: string;
};

type LovableCredentialUpsert = {
  label: string;
  email: string;
  lovable_password: string;
  group_label?: string | null;
  device_label?: string | null;
  login_url: string;
  scan_nonce: string;
  updated_at: string;
};

export type LovableImportResult =
  | {
      status: "success";
      credentials: LovableCredentialCard[];
      importedCount: number;
    }
  | {
      status: "error";
      errors: LovableImportError[];
    };

export async function listLovableCredentialCards(siteOrigin: string): Promise<LovableCredentialCard[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("lovable_credentials")
    .select("*")
    .order("label", { ascending: true });

  if (error) {
    throw new Error(formatLovableStorageError(error, "Could not load Lovable credentials."));
  }

  return Promise.all((data ?? []).map((row) => toCard(row as LovableCredentialRow, siteOrigin)));
}

export async function importLovableCredentialsFromCsv(
  csv: string,
  options: { defaultLoginUrl?: string; siteOrigin: string },
): Promise<LovableImportResult> {
  const parsed = parseLovableCredentialsCsv(csv, {
    defaultLoginUrl: options.defaultLoginUrl ?? DEFAULT_LOVABLE_LOGIN_URL,
  });

  if (parsed.errors.length > 0) {
    return {
      status: "error",
      errors: parsed.errors,
    };
  }

  const admin = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const rows = parsed.credentials.map((credential) => toUpsertRow(credential, now));
  const { error } = await admin.from("lovable_credentials").upsert(rows, { onConflict: "email" });

  if (error) {
    throw new Error(formatLovableStorageError(error, "Could not save Lovable credentials."));
  }

  return {
    status: "success",
    credentials: await listLovableCredentialCards(options.siteOrigin),
    importedCount: parsed.credentials.length,
  };
}

export async function findLovableCredentialByScanToken(token: string): Promise<LovableCredential | null> {
  const tokenParts = verifyLangdockScanToken(token);

  if (!tokenParts) {
    return null;
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("lovable_credentials")
    .select("*")
    .eq("id", tokenParts.id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const row = data as LovableCredentialRow;

  if (row.scan_nonce !== tokenParts.nonce) {
    return null;
  }

  return mapCredential(row);
}

function toUpsertRow(credential: LovableCredentialInput, updatedAt: string): LovableCredentialUpsert {
  return {
    label: credential.label,
    email: credential.email,
    lovable_password: credential.password,
    group_label: credential.group ?? null,
    device_label: credential.device ?? null,
    login_url: credential.loginUrl,
    scan_nonce: createLangdockScanNonce(),
    updated_at: updatedAt,
  };
}

async function toCard(row: LovableCredentialRow, siteOrigin: string): Promise<LovableCredentialCard> {
  const token = createLangdockScanToken({ id: row.id, nonce: row.scan_nonce });
  const qr = await createLovableQrDataUrl(token, siteOrigin);

  return {
    ...mapCredential(row),
    qrPayload: qr.payload,
    qrDataUrl: qr.dataUrl,
  };
}

function mapCredential(row: LovableCredentialRow): LovableCredential {
  return {
    id: row.id,
    label: row.label,
    email: row.email,
    password: row.lovable_password,
    group: row.group_label ?? undefined,
    device: row.device_label ?? undefined,
    loginUrl: row.login_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function formatLovableStorageError(error: { code?: string; message?: string }, fallback: string): string {
  const message = error.message ?? "";

  if (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    message.includes("lovable_credentials") ||
    message.includes("schema cache")
  ) {
    return "Lovable credential storage is not set up yet. Apply the Supabase migration 20260701130000_lovable_credentials.sql, then reload this page.";
  }

  return fallback;
}
