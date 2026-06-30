/* eslint-disable @next/next/no-img-element */
"use client";

import { useActionState, useEffect, useState } from "react";
import { Check, Copy, Printer, Upload } from "lucide-react";
import type { LangdockImportActionState } from "@/app/(admin)/admin/langdock/actions";
import { DEFAULT_LANGDOCK_LOGIN_URL, type LangdockCredentialCard } from "@/lib/domain/langdock";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { TextInput } from "@/components/ui/TextInput";
import styles from "./LangdockCredentialManagement.module.css";

type LangdockCredentialManagementProps = {
  credentials: LangdockCredentialCard[];
  detectedOrigin: string;
  importAction: (
    previousState: LangdockImportActionState,
    formData: FormData,
  ) => Promise<LangdockImportActionState>;
  loadError?: string;
};

const initialState: LangdockImportActionState = {
  status: "idle",
};

const sampleCsv = `label,email,password,group,device
Ada,ada@example.com,example-password,Blue,iPad 1
Ben,ben@example.com,example-password,Blue,iPad 2`;

export function LangdockCredentialManagement({
  credentials,
  detectedOrigin,
  importAction,
  loadError,
}: LangdockCredentialManagementProps) {
  const [state, formAction, isPending] = useActionState(importAction, initialState);
  const [cards, setCards] = useState(credentials);

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
            <h2 id="import-title">Import Langdock credentials</h2>
            <p>Use headers: label, email, password, group, device, loginUrl.</p>
          </div>
        </div>
        <form action={formAction} className={styles.form}>
          {loadError ? <ErrorMessage message={loadError} title="Storage setup needed" /> : null}
          {state.message && state.status === "error" ? (
            <ErrorMessage message={state.message} title="Import failed" />
          ) : null}
          {state.message && state.status === "success" ? <p className={styles.success}>{state.message}</p> : null}
          {state.errors && state.errors.length > 0 ? (
            <div className={styles.errors}>
              {state.errors.map((error, index) => (
                <p key={`${error.row}-${error.field}-${index}`}>
                  Row {error.row}, {error.field}: {error.message}
                </p>
              ))}
            </div>
          ) : null}
          <TextInput
            helperText={`QR links use ${detectedOrigin}`}
            label="Hosted QR origin"
            name="detectedOrigin"
            readOnly
            value={detectedOrigin}
          />
          <TextInput
            defaultValue={DEFAULT_LANGDOCK_LOGIN_URL}
            label="Default Langdock URL"
            name="defaultLoginUrl"
            required
            type="url"
          />
          <label className={styles.field} htmlFor="langdock-csv">
            <span>CSV accounts</span>
            <textarea id="langdock-csv" name="csv" required spellCheck={false} defaultValue={sampleCsv} />
          </label>
          <div className={styles.actions}>
            <Button disabled={isPending} icon={<Upload aria-hidden="true" size={18} />} type="submit">
              {isPending ? "Importing..." : "Import credentials"}
            </Button>
            <Button
              disabled={cards.length === 0}
              icon={<Printer aria-hidden="true" size={18} />}
              onClick={() => window.print()}
              type="button"
              variant="secondary"
            >
              Print QR cards
            </Button>
          </div>
        </form>
      </section>

      <section className={styles.qrPanel} aria-labelledby="qr-title">
        <div className={`${styles.panelHeader} ${styles.noPrint}`}>
          <Printer aria-hidden="true" size={20} />
          <div>
            <h2 id="qr-title">QR cards</h2>
            <p>{cards.length === 1 ? "1 printable card" : `${cards.length} printable cards`}</p>
          </div>
        </div>
        {cards.length > 0 ? (
          <div className={styles.grid}>
            {cards.map((credential) => (
              <LangdockQrCard key={credential.id} credential={credential} />
            ))}
          </div>
        ) : (
          <EmptyState title="No Langdock QR cards yet">Import credentials to generate the first QR cards.</EmptyState>
        )}
      </section>
    </div>
  );
}

function LangdockQrCard({ credential }: { credential: LangdockCredentialCard }) {
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
        <img alt={`Langdock QR code for ${credential.label}`} height={220} src={credential.qrDataUrl} width={220} />
      </div>
      <div className={styles.cardBody}>
        <h3>{credential.label}</h3>
        {meta ? <p>{meta}</p> : <p>Langdock login</p>}
        <code>{credential.email}</code>
        <span>Password available after scan</span>
      </div>
      <Button
        className={styles.copyButton}
        icon={copied ? <Check aria-hidden="true" size={15} /> : <Copy aria-hidden="true" size={15} />}
        onClick={copyLink}
        size="sm"
        type="button"
        variant="ghost"
      >
        {copied ? "Copied" : "Copy link"}
      </Button>
    </article>
  );
}
