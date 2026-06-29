"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import type { LoginActionState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { TextInput } from "@/components/ui/TextInput";
import styles from "./LoginForm.module.css";

type LoginFormProps = {
  action: (previousState: LoginActionState, formData: FormData) => Promise<LoginActionState>;
  defaultUsername?: string;
};

const initialState: LoginActionState = {
  status: "idle",
};

export function LoginForm({ action, defaultUsername = "" }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className={styles.form}>
      {state.message ? <ErrorMessage message={state.message} title="Login failed" /> : null}
      <TextInput
        autoComplete="username"
        defaultValue={defaultUsername}
        error={state.fieldErrors?.username}
        label="Username"
        name="username"
        required
      />
      <TextInput
        autoComplete="current-password"
        error={state.fieldErrors?.password}
        label="Password"
        name="password"
        required
        type="password"
      />
      <Button disabled={isPending} fullWidth icon={<LogIn aria-hidden="true" size={18} />} type="submit">
        {isPending ? "Logging in..." : "Log in"}
      </Button>
    </form>
  );
}
