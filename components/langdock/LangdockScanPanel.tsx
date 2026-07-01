"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import type { LangdockCredential } from "@/lib/domain/langdock";
import { translate, type Locale } from "@/lib/i18n/translations";
import { Button } from "@/components/ui/Button";
import styles from "./LangdockScanPanel.module.css";

type LangdockScanPanelProps = {
  credential: LangdockCredential;
  locale: Locale;
  labels?: {
    assignedLogin: string;
    email: string;
    open: string;
    password: string;
  };
};

type CopyKey = "email" | "password" | null;

export function LangdockScanPanel({ credential, labels, locale }: LangdockScanPanelProps) {
  const [copied, setCopied] = useState<CopyKey>(null);
  const meta = [credential.group, credential.device].filter(Boolean).join(" / ");
  const resolvedLabels = {
    assignedLogin: translate(locale, "langdock.assignedLogin"),
    email: translate(locale, "langdock.email"),
    open: translate(locale, "langdock.open"),
    password: translate(locale, "langdock.password"),
    ...labels,
  };

  async function copyValue(key: Exclude<CopyKey, null>, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(key);
    window.setTimeout(() => setCopied(null), 1400);
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <p>{meta || resolvedLabels.assignedLogin}</p>
        <h1 id="langdock-scan-title">{credential.label}</h1>
      </div>

      <div className={styles.credentials}>
        <CredentialRow
          copied={copied === "email"}
          label={resolvedLabels.email}
          locale={locale}
          onCopy={() => copyValue("email", credential.email)}
          value={credential.email}
        />
        <CredentialRow
          copied={copied === "password"}
          label={resolvedLabels.password}
          locale={locale}
          onCopy={() => copyValue("password", credential.password)}
          value={credential.password}
        />
      </div>

      <a className={styles.openLink} href={credential.loginUrl} target="_blank" rel="noreferrer">
        <ExternalLink aria-hidden="true" size={18} />
        <span>{resolvedLabels.open}</span>
      </a>
    </div>
  );
}

function CredentialRow({
  copied,
  label,
  locale,
  onCopy,
  value,
}: {
  copied: boolean;
  label: string;
  locale: Locale;
  onCopy: () => void;
  value: string;
}) {
  return (
    <div className={styles.credential}>
      <span>{label}</span>
      <strong>{value}</strong>
      <Button
        icon={copied ? <Check aria-hidden="true" size={15} /> : <Copy aria-hidden="true" size={15} />}
        onClick={onCopy}
        size="sm"
        type="button"
        variant="secondary"
      >
        {copied ? translate(locale, "admin.copied") : translate(locale, "admin.copy")}
      </Button>
    </div>
  );
}
