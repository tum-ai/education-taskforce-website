"use server";

import { requireAdmin } from "@/lib/auth/current-account";
import { createParticipantAccount, resetParticipantPassword } from "@/lib/data/accounts";
import { createLoginQrDataUrl } from "@/lib/qr/qrcode";
import { participantAccountSchema } from "@/lib/validation/auth";

export type CredentialActionResult = {
  accountId: string;
  username: string;
  displayName: string;
  temporaryPassword: string;
  qrPayload: string;
  qrDataUrl: string;
};

export type AccountActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  credential?: CredentialActionResult;
};

const idleState: AccountActionState = {
  status: "idle",
};

export async function createParticipantFormAction(
  _previousState: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  await requireAdmin();

  const parsed = participantAccountSchema.safeParse({
    username: formData.get("username"),
    displayName: formData.get("displayName"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: Object.fromEntries(
        Object.entries(parsed.error.flatten().fieldErrors).map(([key, value]) => [key, value?.[0] ?? ""]),
      ),
    };
  }

  try {
    const result = await createParticipantAccount(parsed.data);
    const qr = await createLoginQrDataUrl(result.account.username);

    return {
      ...idleState,
      status: "success",
      message: "Participant account created.",
      credential: {
        accountId: result.account.id,
        username: result.account.username,
        displayName: result.account.displayName,
        temporaryPassword: result.temporaryPassword,
        qrPayload: qr.payload,
        qrDataUrl: qr.dataUrl,
      },
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Could not create the participant account.",
    };
  }
}

export async function resetParticipantPasswordFormAction(
  _previousState: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  await requireAdmin();

  const accountId = String(formData.get("accountId") ?? "");

  if (!accountId) {
    return { status: "error", message: "Choose a participant account." };
  }

  try {
    const result = await resetParticipantPassword(accountId);
    const qr = await createLoginQrDataUrl(result.account.username);

    return {
      status: "success",
      message: "Password reset.",
      credential: {
        accountId: result.account.id,
        username: result.account.username,
        displayName: result.account.displayName,
        temporaryPassword: result.temporaryPassword,
        qrPayload: qr.payload,
        qrDataUrl: qr.dataUrl,
      },
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Could not reset the password.",
    };
  }
}
