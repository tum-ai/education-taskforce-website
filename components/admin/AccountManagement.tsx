"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import { Check, Copy, KeyRound, Plus, RotateCcw } from "lucide-react";
import type { Account } from "@/lib/domain/types";
import { LOCALE_COOKIE, translate, type Locale } from "@/lib/i18n/translations";
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
  locale: Locale;
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

function PasswordCell({ locale, password }: { locale: Locale; password?: string | null }) {
  const [copied, setCopied] = useState(false);
  const passwordValue = password ?? "";

  if (!passwordValue) {
    return <span className={styles.missingPassword}>{translate(locale, "admin.resetToSave")}</span>;
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
        aria-label={copied ? translate(locale, "admin.passwordCopied") : translate(locale, "admin.copyPassword")}
        icon={copied ? <Check aria-hidden="true" size={15} /> : <Copy aria-hidden="true" size={15} />}
        onClick={copyPassword}
        size="sm"
        type="button"
        variant="ghost"
      >
        {copied ? translate(locale, "admin.copied") : translate(locale, "admin.copy")}
      </Button>
    </div>
  );
}

function ResetPasswordForm({
  account,
  locale,
  onCredential,
  resetAction,
}: {
  account: Account;
  locale: Locale;
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
        <CredentialCard credential={state.credential} locale={locale} onDismiss={() => setVisible(false)} />
      ) : null}
      {state.message && state.status === "error" ? (
        <ErrorMessage message={state.message} title={translate(locale, "admin.resetFailed")} />
      ) : null}
      <form action={formAction}>
        <input name="accountId" type="hidden" value={account.id} />
        <input name={LOCALE_COOKIE} type="hidden" value={locale} />
        <Button
          disabled={isPending}
          icon={<RotateCcw aria-hidden="true" size={16} />}
          size="sm"
          type="submit"
          variant="secondary"
        >
          {isPending ? translate(locale, "admin.resetting") : translate(locale, "admin.resetPassword")}
        </Button>
      </form>
    </div>
  );
}

export function AccountManagement({ accounts, createAction, locale, resetAction }: AccountManagementProps) {
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
            <h2 id="create-account-title">{translate(locale, "admin.createParticipant")}</h2>
            <p>{translate(locale, "admin.createParticipantBody")}</p>
          </div>
        </div>
        <form action={formAction} className={styles.form}>
          <input name={LOCALE_COOKIE} type="hidden" value={locale} />
          {state.message && state.status === "error" ? (
            <ErrorMessage message={state.message} title={translate(locale, "admin.creationFailed")} />
          ) : null}
          {state.credential && credentialVisible ? (
            <CredentialCard credential={state.credential} locale={locale} onDismiss={() => setCredentialVisible(false)} />
          ) : null}
          <TextInput
            error={state.fieldErrors?.displayName}
            label={translate(locale, "admin.displayName")}
            name="displayName"
            placeholder="Student Group A"
            required
          />
          <TextInput
            error={state.fieldErrors?.username}
            helperText={translate(locale, "admin.leaveBlankUsername")}
            label={translate(locale, "admin.username")}
            name="username"
            placeholder="student-group-a"
          />
          <Button disabled={isPending} icon={<KeyRound aria-hidden="true" size={18} />} type="submit">
            {isPending ? translate(locale, "admin.creating") : translate(locale, "admin.createAccount")}
          </Button>
        </form>
      </section>

      <section className={styles.panel} aria-labelledby="participant-list-title">
        <div className={styles.panelHeader}>
          <KeyRound aria-hidden="true" size={20} />
          <div>
            <h2 id="participant-list-title">{translate(locale, "admin.participantAccounts")}</h2>
            <p>
              {participantAccounts.length === 1
                ? translate(locale, "admin.account")
                : translate(locale, "admin.accounts", { count: participantAccounts.length })}
            </p>
          </div>
        </div>
        {participantAccounts.length > 0 ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{translate(locale, "admin.name")}</th>
                  <th>{translate(locale, "admin.username")}</th>
                  <th>{translate(locale, "admin.password")}</th>
                  <th>{translate(locale, "admin.role")}</th>
                  <th>{translate(locale, "admin.credentialsColumn")}</th>
                </tr>
              </thead>
              <tbody>
                {participantAccounts.map((account) => (
                  <tr key={account.id}>
                    <td>{account.displayName}</td>
                    <td>{account.username}</td>
                    <td>
                      <PasswordCell locale={locale} password={account.temporaryPassword} />
                    </td>
                    <td>{account.role}</td>
                    <td>
                      <ResetPasswordForm account={account} locale={locale} onCredential={handleCredential} resetAction={resetAction} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title={translate(locale, "admin.noParticipantAccounts")}>
            {translate(locale, "admin.noParticipantAccountsBody")}
          </EmptyState>
        )}
      </section>
    </div>
  );
}
