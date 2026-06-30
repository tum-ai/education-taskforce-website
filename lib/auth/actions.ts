import "server-only";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loginSchema, usernameToInternalEmail } from "@/lib/validation/auth";
import { getCurrentAccount } from "@/lib/auth/current-account";
import { LOCALE_COOKIE, normalizeLocale, translate } from "@/lib/i18n/translations";

export type LoginActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

export async function signInWithUsername(username: string, password: string) {
  const supabase = await createSupabaseServerClient();
  const email = usernameToInternalEmail(username);

  return supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signOut() {
  "use server";

  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function loginAction(_previousState: LoginActionState, formData: FormData): Promise<LoginActionState> {
  const locale = normalizeLocale(formData.get(LOCALE_COOKIE));
  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
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
    const { error } = await signInWithUsername(parsed.data.username, parsed.data.password);

    if (error) {
      return { status: "error", message: translate(locale, "login.invalid") };
    }
  } catch {
    return { status: "error", message: translate(locale, "login.unavailable") };
  }

  const account = await getCurrentAccount();

  if (account?.role === "admin") {
    redirect("/admin");
  }

  redirect("/portal");
}
