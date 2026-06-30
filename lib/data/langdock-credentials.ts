import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  DEFAULT_LANGDOCK_LOGIN_URL,
  type LangdockCredential,
  type LangdockCredentialCard,
  type LangdockCredentialInput,
  type LangdockImportError,
  parseLangdockCredentialsCsv,
} from "@/lib/domain/langdock";
import { createLangdockQrDataUrl } from "@/lib/qr/qrcode";
import {
  createLangdockScanNonce,
  createLangdockScanToken,
  verifyLangdockScanToken,
} from "@/lib/langdock/tokens";

type LangdockCredentialRow = {
  id: string;
  label: string;
  email: string;
  langdock_password: string;
  group_label: string | null;
  device_label: string | null;
  login_url: string;
  scan_nonce: string;
  created_at: string;
  updated_at: string;
};

type LangdockCredentialUpsert = {
  label: string;
  email: string;
  langdock_password: string;
  group_label?: string | null;
  device_label?: string | null;
  login_url: string;
  scan_nonce: string;
  updated_at: string;
};

export type LangdockImportResult =
  | {
      status: "success";
      credentials: LangdockCredentialCard[];
      importedCount: number;
    }
  | {
      status: "error";
      errors: LangdockImportError[];
    };

export async function listLangdockCredentialCards(siteOrigin: string): Promise<LangdockCredentialCard[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("langdock_credentials")
    .select("*")
    .order("label", { ascending: true });

  if (error) {
    throw new Error(formatLangdockStorageError(error, "Could not load Langdock credentials."));
  }

  return Promise.all((data ?? []).map((row) => toCard(row as LangdockCredentialRow, siteOrigin)));
}

export async function importLangdockCredentialsFromCsv(
  csv: string,
  options: { defaultLoginUrl?: string; siteOrigin: string },
): Promise<LangdockImportResult> {
  const parsed = parseLangdockCredentialsCsv(csv, {
    defaultLoginUrl: options.defaultLoginUrl ?? DEFAULT_LANGDOCK_LOGIN_URL,
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
  const { error } = await admin.from("langdock_credentials").upsert(rows, { onConflict: "email" });

  if (error) {
    throw new Error(formatLangdockStorageError(error, "Could not save Langdock credentials."));
  }

  return {
    status: "success",
    credentials: await listLangdockCredentialCards(options.siteOrigin),
    importedCount: parsed.credentials.length,
  };
}

export async function findLangdockCredentialByScanToken(token: string): Promise<LangdockCredential | null> {
  const tokenParts = verifyLangdockScanToken(token);

  if (!tokenParts) {
    return null;
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("langdock_credentials")
    .select("*")
    .eq("id", tokenParts.id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const row = data as LangdockCredentialRow;

  if (row.scan_nonce !== tokenParts.nonce) {
    return null;
  }

  return mapCredential(row);
}

function toUpsertRow(credential: LangdockCredentialInput, updatedAt: string): LangdockCredentialUpsert {
  return {
    label: credential.label,
    email: credential.email,
    langdock_password: credential.password,
    group_label: credential.group ?? null,
    device_label: credential.device ?? null,
    login_url: credential.loginUrl,
    scan_nonce: createLangdockScanNonce(),
    updated_at: updatedAt,
  };
}

async function toCard(row: LangdockCredentialRow, siteOrigin: string): Promise<LangdockCredentialCard> {
  const token = createLangdockScanToken({ id: row.id, nonce: row.scan_nonce });
  const qr = await createLangdockQrDataUrl(token, siteOrigin);

  return {
    ...mapCredential(row),
    qrPayload: qr.payload,
    qrDataUrl: qr.dataUrl,
  };
}

function mapCredential(row: LangdockCredentialRow): LangdockCredential {
  return {
    id: row.id,
    label: row.label,
    email: row.email,
    password: row.langdock_password,
    group: row.group_label ?? undefined,
    device: row.device_label ?? undefined,
    loginUrl: row.login_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function formatLangdockStorageError(error: { code?: string; message?: string }, fallback: string): string {
  const message = error.message ?? "";

  if (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    message.includes("langdock_credentials") ||
    message.includes("schema cache")
  ) {
    return "Langdock credential storage is not set up yet. Apply the Supabase migration 20260629220000_langdock_credentials.sql, then reload this page.";
  }

  return fallback;
}
