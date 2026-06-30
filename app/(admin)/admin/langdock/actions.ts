"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/current-account";
import {
  type LangdockCredentialCard,
  type LangdockImportError,
  DEFAULT_LANGDOCK_LOGIN_URL,
} from "@/lib/domain/langdock";
import { importLangdockCredentialsFromCsv } from "@/lib/data/langdock-credentials";
import { getCurrentRequestOrigin } from "@/lib/qr/origin";

export type LangdockImportActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: LangdockImportError[];
  credentials?: LangdockCredentialCard[];
};

export async function importLangdockCredentialsFormAction(
  _previousState: LangdockImportActionState,
  formData: FormData,
): Promise<LangdockImportActionState> {
  await requireAdmin();

  const csv = String(formData.get("csv") ?? "");
  const defaultLoginUrl = String(formData.get("defaultLoginUrl") ?? DEFAULT_LANGDOCK_LOGIN_URL);

  try {
    const result = await importLangdockCredentialsFromCsv(csv, {
      defaultLoginUrl,
      siteOrigin: await getCurrentRequestOrigin(),
    });

    if (result.status === "error") {
      return {
        status: "error",
        message: "Import blocked.",
        errors: result.errors,
      };
    }

    revalidatePath("/admin/langdock");

    return {
      status: "success",
      message: `Imported ${result.importedCount} Langdock credential${result.importedCount === 1 ? "" : "s"}.`,
      credentials: result.credentials,
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Could not import Langdock credentials.",
    };
  }
}
