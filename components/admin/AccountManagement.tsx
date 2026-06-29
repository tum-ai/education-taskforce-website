"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import { Check, Copy, KeyRound, Plus, RotateCcw } from "lucide-react";
import type { Account } from "@/lib/domain/types";
import type { AccountActionState, CredentialActionResult } from "@/app/(admin)/admin/accounts/actions";
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

function upsertCredentialAccount(accounts: Account[], credential: CredentialActionResult): Account[] {
  const nextAccount: Account = {
    id: credential.accountId,
    username: credential.username,
    displayName: credential.displayName,
    role: "participant",
    temporaryPassword: credential.temporaryPassword,
  };
  const exists = accounts.some((account) => account.id === credential.accountId);
  const nextAccounts = exists
    ? accounts.map((account) =>
        account.id === credential.accountId
          ? {
              ...account,
              username: credential.username,
              displayName: credential.displayName,
              temporaryPassword: credential.temporaryPassword,
            }
          : account,
      )
    : [...accounts, nextAccount];

  return nextAccounts.sort((first, second) => first.displayName.localeCompare(second.displayName));
}

function PasswordCell({ password }: { password?: string | null }) {
  const [copied, setCopied] = useState(false);
  const passwordValue = password ?? "";

  if (!passwordValue) {
    return <span className={styles.missingPassword}>Reset once to save password</span>;
  }

  async function copyPassword() {
    await navigator.clipboard.writeText(passwordValue);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className={styles.passwordCell}>
      <code>{passwordValue}</code>
      <Button
        aria-label={copied ? "Password copied" : "Copy password"}
        icon={copied ? <Check aria-hidden="true" size={15} /> : <Copy aria-hidden="true" size={15} />}
        onClick={copyPassword}
        size="sm"
        type="button"
        variant="ghost"
      >
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}

function ResetPasswordForm({
  account,
  onCredential,
  resetAction,
}: {
  account: Account;
  onCredential: (credential: CredentialActionResult) => void;
  resetAction: AccountManagementProps["resetAction"];
}) {
  const [state, formAction, isPending] = useActionState(resetAction, initialState);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (state.credential) {
      setVisible(true);
      onCredential(state.credential);
    }
  }, [onCredential, state.credential]);

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
  const [participantAccounts, setParticipantAccounts] = useState(accounts);
  const handleCredential = useCallback((credential: CredentialActionResult) => {
    setParticipantAccounts((currentAccounts) => upsertCredentialAccount(currentAccounts, credential));
  }, []);

  useEffect(() => {
    setParticipantAccounts(accounts);
  }, [accounts]);

  useEffect(() => {
    if (state.credential) {
      setCredentialVisible(true);
      handleCredential(state.credential);
    }
  }, [handleCredential, state.credential]);

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
            placeholder="Student Group A"
            required
          />
          <TextInput
            error={state.fieldErrors?.username}
            helperText="Leave blank to generate one."
            label="Username"
            name="username"
            placeholder="student-group-a"
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
            <p>{participantAccounts.length === 1 ? "1 account" : `${participantAccounts.length} accounts`}</p>
          </div>
        </div>
        {participantAccounts.length > 0 ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Password</th>
                  <th>Role</th>
                  <th>Credentials</th>
                </tr>
              </thead>
              <tbody>
                {participantAccounts.map((account) => (
                  <tr key={account.id}>
                    <td>{account.displayName}</td>
                    <td>{account.username}</td>
                    <td>
                      <PasswordCell password={account.temporaryPassword} />
                    </td>
                    <td>{account.role}</td>
                    <td>
                      <ResetPasswordForm account={account} onCredential={handleCredential} resetAction={resetAction} />
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
