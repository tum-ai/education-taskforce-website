import "server-only";

import { redirect } from "next/navigation";
import { mapAccount } from "@/lib/supabase/mapper";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicSupabaseEnv } from "@/lib/supabase/env";
import type { Account } from "@/lib/domain/types";

export async function getCurrentAccount(): Promise<Account | null> {
  if (!getPublicSupabaseEnv()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase.from("accounts").select("*").eq("id", user.id).maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapAccount(data);
}

export async function requireUser(): Promise<Account> {
  const account = await getCurrentAccount();

  if (!account) {
    redirect("/login");
  }

  return account;
}

export async function requireAdmin(): Promise<Account> {
  const account = await requireUser();

  if (account.role !== "admin") {
    redirect("/portal");
  }

  return account;
}

export async function requireParticipant(): Promise<Account> {
  const account = await requireUser();

  if (account.role !== "participant") {
    redirect("/admin");
  }

  return account;
}
