"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import type { LangdockCredential } from "@/lib/domain/langdock";
import { Button } from "@/components/ui/Button";
import styles from "./LangdockScanPanel.module.css";

type LangdockScanPanelProps = {
  credential: LangdockCredential;
};

type CopyKey = "email" | "password" | null;

export function LangdockScanPanel({ credential }: LangdockScanPanelProps) {
  const [copied, setCopied] = useState<CopyKey>(null);
  const meta = [credential.group, credential.device].filter(Boolean).join(" / ");

  async function copyValue(key: Exclude<CopyKey, null>, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(key);
    window.setTimeout(() => setCopied(null), 1400);
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <p>{meta || "Assigned Langdock login"}</p>
        <h1 id="langdock-scan-title">{credential.label}</h1>
      </div>

      <div className={styles.credentials}>
        <CredentialRow
          copied={copied === "email"}
          label="Email"
          onCopy={() => copyValue("email", credential.email)}
          value={credential.email}
        />
        <CredentialRow
          copied={copied === "password"}
          label="Password"
          onCopy={() => copyValue("password", credential.password)}
          value={credential.password}
        />
      </div>

      <a className={styles.openLink} href={credential.loginUrl} target="_blank" rel="noreferrer">
        <ExternalLink aria-hidden="true" size={18} />
        <span>Open Langdock</span>
      </a>
    </div>
  );
}

function CredentialRow({
  copied,
  label,
  onCopy,
  value,
}: {
  copied: boolean;
  label: string;
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
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}
