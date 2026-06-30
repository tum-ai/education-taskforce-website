"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import type { LoginActionState } from "@/lib/auth/actions";
import { LOCALE_COOKIE, translate, type Locale } from "@/lib/i18n/translations";
import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { TextInput } from "@/components/ui/TextInput";
import styles from "./LoginForm.module.css";

type LoginFormProps = {
  action: (previousState: LoginActionState, formData: FormData) => Promise<LoginActionState>;
  defaultUsername?: string;
  locale: Locale;
};

const initialState: LoginActionState = {
  status: "idle",
};

export function LoginForm({ action, defaultUsername = "", locale }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className={styles.form}>
      {state.message ? <ErrorMessage message={state.message} title={translate(locale, "login.failed")} /> : null}
      <input name={LOCALE_COOKIE} type="hidden" value={locale} />
      <TextInput
        autoComplete="username"
        defaultValue={defaultUsername}
        error={state.fieldErrors?.username}
        label={translate(locale, "login.username")}
        name="username"
        required
      />
      <TextInput
        autoComplete="current-password"
        error={state.fieldErrors?.password}
        label={translate(locale, "login.password")}
        name="password"
        required
        type="password"
      />
      <Button disabled={isPending} fullWidth icon={<LogIn aria-hidden="true" size={18} />} type="submit">
        {isPending ? translate(locale, "nav.loggingIn") : translate(locale, "nav.login")}
      </Button>
    </form>
  );
}
