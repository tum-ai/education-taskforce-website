"use client";

import { useActionState, useEffect, useState } from "react";
import { KeyRound, Plus, RotateCcw } from "lucide-react";
import type { Account } from "@/lib/domain/types";
import type { AccountActionState } from "@/app/(admin)/admin/accounts/actions";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { TextInput } from "@/components/ui/TextInput";
import { CredentialCard } from "@/components/admin/CredentialCard";
import styles from "./AccountManagement.module.css";

type AccountManagementProps = {
  accounts: Account[];
  createAction: (previousState: AccountActionState, formData: FormData) => Promise<AccountActionState>;
  resetAction: (previousState: AccountActionState, formData: FormData) => Promise<AccountActionState>;
};

const initialState: AccountActionState = {
  status: "idle",
};

function ResetPasswordForm({
  account,
  resetAction,
}: {
  account: Account;
  resetAction: AccountManagementProps["resetAction"];
}) {
  const [state, formAction, isPending] = useActionState(resetAction, initialState);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (state.credential) {
      setVisible(true);
    }
  }, [state.credential]);

  return (
    <div className={styles.resetCell}>
      {state.credential && visible ? (
        <CredentialCard credential={state.credential} onDismiss={() => setVisible(false)} />
      ) : null}
      {state.message && state.status === "error" ? <ErrorMessage message={state.message} title="Reset failed" /> : null}
      <form action={formAction}>
        <input name="accountId" type="hidden" value={account.id} />
        <Button
          disabled={isPending}
          icon={<RotateCcw aria-hidden="true" size={16} />}
          size="sm"
          type="submit"
          variant="secondary"
        >
          {isPending ? "Resetting..." : "Reset password"}
        </Button>
      </form>
    </div>
  );
}

export function AccountManagement({ accounts, createAction, resetAction }: AccountManagementProps) {
  const [state, formAction, isPending] = useActionState(createAction, initialState);
  const [credentialVisible, setCredentialVisible] = useState(true);

  useEffect(() => {
    if (state.credential) {
      setCredentialVisible(true);
    }
  }, [state.credential]);

  return (
    <div className={styles.layout}>
      <section className={styles.panel} aria-labelledby="create-account-title">
        <div className={styles.panelHeader}>
          <Plus aria-hidden="true" size={20} />
          <div>
            <h2 id="create-account-title">Create participant</h2>
            <p>Creates a Supabase login and a participant account row.</p>
          </div>
        </div>
        <form action={formAction} className={styles.form}>
          {state.message && state.status === "error" ? <ErrorMessage message={state.message} title="Creation failed" /> : null}
          {state.credential && credentialVisible ? (
            <CredentialCard credential={state.credential} onDismiss={() => setCredentialVisible(false)} />
          ) : null}
          <TextInput
            error={state.fieldErrors?.displayName}
            label="Display name"
            name="displayName"
            placeholder="Family Fuchs"
            required
          />
          <TextInput
            error={state.fieldErrors?.username}
            helperText="Leave blank to generate one."
            label="Username"
            name="username"
            placeholder="family-fuchs"
          />
          <Button disabled={isPending} icon={<KeyRound aria-hidden="true" size={18} />} type="submit">
            {isPending ? "Creating..." : "Create account"}
          </Button>
        </form>
      </section>

      <section className={styles.panel} aria-labelledby="participant-list-title">
        <div className={styles.panelHeader}>
          <KeyRound aria-hidden="true" size={20} />
          <div>
            <h2 id="participant-list-title">Participant accounts</h2>
            <p>{accounts.length === 1 ? "1 account" : `${accounts.length} accounts`}</p>
          </div>
        </div>
        {accounts.length > 0 ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Credentials</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.id}>
                    <td>{account.displayName}</td>
                    <td>{account.username}</td>
                    <td>{account.role}</td>
                    <td>
                      <ResetPasswordForm account={account} resetAction={resetAction} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No participant accounts yet">Create the first participant account to start uploading outcomes.</EmptyState>
        )}
      </section>
    </div>
  );
}
