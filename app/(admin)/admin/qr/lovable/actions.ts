"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/current-account";
import { importLovableCredentialsFromCsv } from "@/lib/data/lovable-credentials";
import {
  DEFAULT_LOVABLE_LOGIN_URL,
  type LovableCredentialCard,
  type LovableImportError,
} from "@/lib/domain/lovable";
import { LOCALE_COOKIE, normalizeLocale, translate } from "@/lib/i18n/translations";
import { getCurrentRequestOrigin } from "@/lib/qr/origin";

export type LovableImportActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: LovableImportError[];
  credentials?: LovableCredentialCard[];
};

export async function importLovableCredentialsFormAction(
  _previousState: LovableImportActionState,
  formData: FormData,
): Promise<LovableImportActionState> {
  await requireAdmin();
  const locale = normalizeLocale(formData.get(LOCALE_COOKIE));

  const csv = String(formData.get("csv") ?? "");
  const defaultLoginUrl = String(formData.get("defaultLoginUrl") ?? DEFAULT_LOVABLE_LOGIN_URL);

  try {
    const result = await importLovableCredentialsFromCsv(csv, {
      defaultLoginUrl,
      siteOrigin: await getCurrentRequestOrigin(),
    });

    if (result.status === "error") {
      return {
        status: "error",
        message: translate(locale, "admin.importBlocked"),
        errors: result.errors,
      };
    }

    revalidatePath("/admin/qr/lovable");

    return {
      status: "success",
      message:
        result.importedCount === 1
          ? translate(locale, "admin.importedLovableOne")
          : translate(locale, "admin.importedLovableMany", { count: result.importedCount }),
      credentials: result.credentials,
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : translate(locale, "admin.couldNotImportLovable"),
    };
  }
}
