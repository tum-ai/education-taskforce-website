import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mapAccount } from "@/lib/supabase/mapper";
import type { Account } from "@/lib/domain/types";
import { generateTemporaryPassword } from "@/lib/domain/passwords";
import { buildParticipantUsername } from "@/lib/domain/usernames";
import { participantAccountSchema, usernameToInternalEmail } from "@/lib/validation/auth";

type CreateParticipantInput = {
  username?: string;
  displayName: string;
};

type CredentialResult = {
  account: Account;
  temporaryPassword: string;
};

export async function listParticipantAccounts(): Promise<Account[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("role", "participant")
    .order("display_name", { ascending: true });

  if (error) {
    throw new Error("Could not load participant accounts.");
  }

  return (data ?? []).map(mapAccount);
}

export async function listAllAccounts(): Promise<Account[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("accounts").select("*").order("created_at", { ascending: false });

  if (error) {
    throw new Error("Could not load accounts.");
  }

  return (data ?? []).map(mapAccount);
}

async function usernameExists(username: string): Promise<boolean> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("accounts").select("id").eq("username", username).maybeSingle();

  if (error) {
    throw new Error("Could not check username availability.");
  }

  return Boolean(data);
}

export async function createAvailableParticipantUsername(displayName: string): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const suffix = Math.random().toString(36).slice(2, 7);
    const username = buildParticipantUsername(displayName, suffix);

    if (!(await usernameExists(username))) {
      return username;
    }
  }

  throw new Error("Could not generate an available username.");
}

export async function createParticipantAccount(input: CreateParticipantInput): Promise<CredentialResult> {
  const parsed = participantAccountSchema.parse(input);
  const username = parsed.username || (await createAvailableParticipantUsername(parsed.displayName));
  const temporaryPassword = generateTemporaryPassword();
  const admin = createSupabaseAdminClient();
  const email = usernameToInternalEmail(username);

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password: temporaryPassword,
    email_confirm: true,
    user_metadata: {
      username,
      display_name: parsed.displayName,
      role: "participant",
    },
  });

  if (authError || !authData.user) {
    throw new Error("Could not create the participant login.");
  }

  const { data: accountRow, error: accountError } = await admin
    .from("accounts")
    .insert({
      id: authData.user.id,
      username,
      display_name: parsed.displayName,
      role: "participant",
    })
    .select("*")
    .single();

  if (accountError || !accountRow) {
    await admin.auth.admin.deleteUser(authData.user.id);
    throw new Error("Could not create the participant account.");
  }

  return {
    account: mapAccount(accountRow),
    temporaryPassword,
  };
}

export async function resetParticipantPassword(accountId: string): Promise<CredentialResult> {
  const admin = createSupabaseAdminClient();
  const { data: accountRow, error: accountError } = await admin
    .from("accounts")
    .select("*")
    .eq("id", accountId)
    .eq("role", "participant")
    .single();

  if (accountError || !accountRow) {
    throw new Error("Participant account not found.");
  }

  const temporaryPassword = generateTemporaryPassword();
  const { error } = await admin.auth.admin.updateUserById(accountId, {
    password: temporaryPassword,
  });

  if (error) {
    throw new Error("Could not reset the password.");
  }

  return {
    account: mapAccount(accountRow),
    temporaryPassword,
  };
}
