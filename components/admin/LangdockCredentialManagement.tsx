/* eslint-disable @next/next/no-img-element */
"use client";

import { useActionState, useEffect, useState } from "react";
import { Check, Copy, Printer, Upload } from "lucide-react";
import { DEFAULT_LANGDOCK_LOGIN_URL, type LangdockCredentialCard, type LangdockImportError } from "@/lib/domain/langdock";
import { LOCALE_COOKIE, translate, type Locale } from "@/lib/i18n/translations";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { TextInput } from "@/components/ui/TextInput";
import styles from "./LangdockCredentialManagement.module.css";

export type CredentialImportActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: LangdockImportError[];
  credentials?: LangdockCredentialCard[];
};

type LangdockCredentialManagementProps = {
  credentials: LangdockCredentialCard[];
  defaultLoginUrl?: string;
  detectedOrigin: string;
  importAction: (
    previousState: CredentialImportActionState,
    formData: FormData,
  ) => Promise<CredentialImportActionState>;
  labels?: {
    cardAltPrefix: string;
    defaultLoginUrl: string;
    importBody: string;
    importTitle: string;
    loginFallback: string;
    noCardsBody: string;
    noCardsTitle: string;
  };
  locale: Locale;
  loadError?: string;
  sampleCsv?: string;
  textareaId?: string;
};

const initialState: CredentialImportActionState = {
  status: "idle",
};

const defaultSampleCsv = `label,email,password,group,device
Ada,ada@example.com,example-password,Blue,iPad 1
Ben,ben@example.com,example-password,Blue,iPad 2`;

export function LangdockCredentialManagement({
  credentials,
  defaultLoginUrl = DEFAULT_LANGDOCK_LOGIN_URL,
  detectedOrigin,
  importAction,
  labels,
  locale,
  loadError,
  sampleCsv = defaultSampleCsv,
  textareaId = "langdock-csv",
}: LangdockCredentialManagementProps) {
  const [state, formAction, isPending] = useActionState(importAction, initialState);
  const [cards, setCards] = useState(credentials);
  const resolvedLabels = {
    cardAltPrefix: "Langdock QR code for",
    defaultLoginUrl: translate(locale, "admin.defaultLangdockUrl"),
    importBody: translate(locale, "admin.importLangdockBody"),
    importTitle: translate(locale, "admin.importLangdock"),
    loginFallback: translate(locale, "admin.langdockLogin"),
    noCardsBody: translate(locale, "admin.noLangdockCardsBody"),
    noCardsTitle: translate(locale, "admin.noLangdockCards"),
    ...labels,
  };

  useEffect(() => {
    setCards(credentials);
  }, [credentials]);

  useEffect(() => {
    if (state.credentials) {
      setCards(state.credentials);
    }
  }, [state.credentials]);

  return (
    <div className={styles.layout}>
      <section className={`${styles.panel} ${styles.noPrint}`} aria-labelledby="import-title">
        <div className={styles.panelHeader}>
          <Upload aria-hidden="true" size={20} />
          <div>
            <h2 id="import-title">{resolvedLabels.importTitle}</h2>
            <p>{resolvedLabels.importBody}</p>
          </div>
        </div>
        <form action={formAction} className={styles.form}>
          <input name={LOCALE_COOKIE} type="hidden" value={locale} />
          {loadError ? <ErrorMessage message={loadError} title={translate(locale, "admin.storageSetupNeeded")} /> : null}
          {state.message && state.status === "error" ? (
            <ErrorMessage message={state.message} title={translate(locale, "admin.importFailed")} />
          ) : null}
          {state.message && state.status === "success" ? <p className={styles.success}>{state.message}</p> : null}
          {state.errors && state.errors.length > 0 ? (
            <div className={styles.errors}>
              {state.errors.map((error, index) => (
                <p key={`${error.row}-${error.field}-${index}`}>
                  {translate(locale, "admin.rowError", {
                    field: error.field,
                    message: error.message,
                    row: error.row,
                  })}
                </p>
              ))}
            </div>
          ) : null}
          <TextInput
            helperText={translate(locale, "admin.qrLinksUse", { origin: detectedOrigin })}
            label={translate(locale, "admin.hostedQrOrigin")}
            name="detectedOrigin"
            readOnly
            value={detectedOrigin}
          />
          <TextInput
            defaultValue={defaultLoginUrl}
            label={resolvedLabels.defaultLoginUrl}
            name="defaultLoginUrl"
            required
            type="url"
          />
          <label className={styles.field} htmlFor={textareaId}>
            <span>{translate(locale, "admin.csvAccounts")}</span>
            <textarea id={textareaId} name="csv" required spellCheck={false} defaultValue={sampleCsv} />
          </label>
          <div className={styles.actions}>
            <Button disabled={isPending} icon={<Upload aria-hidden="true" size={18} />} type="submit">
              {isPending ? translate(locale, "admin.importing") : translate(locale, "admin.importCredentials")}
            </Button>
            <Button
              disabled={cards.length === 0}
              icon={<Printer aria-hidden="true" size={18} />}
              onClick={() => window.print()}
              type="button"
              variant="secondary"
            >
              {translate(locale, "admin.printQrCards")}
            </Button>
          </div>
        </form>
      </section>

      <section className={styles.qrPanel} aria-labelledby="qr-title">
        <div className={`${styles.panelHeader} ${styles.noPrint}`}>
          <Printer aria-hidden="true" size={20} />
          <div>
            <h2 id="qr-title">{translate(locale, "admin.qrCards")}</h2>
            <p>
              {cards.length === 1
                ? translate(locale, "admin.printableCard")
                : translate(locale, "admin.printableCards", { count: cards.length })}
            </p>
          </div>
        </div>
        {cards.length > 0 ? (
          <div className={styles.grid}>
            {cards.map((credential) => (
              <LangdockQrCard
                altPrefix={resolvedLabels.cardAltPrefix}
                key={credential.id}
                credential={credential}
                locale={locale}
                loginFallback={resolvedLabels.loginFallback}
              />
            ))}
          </div>
        ) : (
          <EmptyState title={resolvedLabels.noCardsTitle}>{resolvedLabels.noCardsBody}</EmptyState>
        )}
      </section>
    </div>
  );
}

function LangdockQrCard({
  altPrefix,
  credential,
  locale,
  loginFallback,
}: {
  altPrefix: string;
  credential: LangdockCredentialCard;
  locale: Locale;
  loginFallback: string;
}) {
  const [copied, setCopied] = useState(false);
  const meta = [credential.group, credential.device].filter(Boolean).join(" / ");

  async function copyLink() {
    await navigator.clipboard.writeText(credential.qrPayload);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <article className={styles.card}>
      <div className={styles.qrImage}>
        <img alt={`${altPrefix} ${credential.label}`} height={220} src={credential.qrDataUrl} width={220} />
      </div>
      <div className={styles.cardBody}>
        <h3>{credential.label}</h3>
        {meta ? <p>{meta}</p> : <p>{loginFallback}</p>}
        <code>{credential.email}</code>
        <span>{translate(locale, "admin.passwordAvailableAfterScan")}</span>
      </div>
      <Button
        className={styles.copyButton}
        icon={copied ? <Check aria-hidden="true" size={15} /> : <Copy aria-hidden="true" size={15} />}
        onClick={copyLink}
        size="sm"
        type="button"
        variant="ghost"
      >
        {copied ? translate(locale, "admin.copied") : translate(locale, "admin.copyLink")}
      </Button>
    </article>
  );
}
