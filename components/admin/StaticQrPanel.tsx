/* eslint-disable @next/next/no-img-element */
"use client";

import { ExternalLink, Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { translate, type Locale } from "@/lib/i18n/translations";
import styles from "./StaticQrPanel.module.css";

type StaticQrPanelProps = {
  dataUrl: string;
  description: string;
  locale: Locale;
  payload: string;
  title: string;
};

export function StaticQrPanel({ dataUrl, description, locale, payload, title }: StaticQrPanelProps) {
  return (
    <section className={styles.panel} aria-labelledby="static-qr-title">
      <div className={styles.qrBox}>
        <img alt={`${title} QR code`} height={220} src={dataUrl} width={220} />
      </div>
      <div className={styles.body}>
        <h2 id="static-qr-title">{title}</h2>
        <p>{description}</p>
        <code className={styles.payload}>{payload}</code>
        <div className={styles.actions}>
          <Button icon={<Printer aria-hidden="true" size={18} />} onClick={() => window.print()} type="button">
            {translate(locale, "admin.printQrCards")}
          </Button>
          <Button
            icon={<ExternalLink aria-hidden="true" size={18} />}
            onClick={() => window.open(payload, "_blank", "noopener,noreferrer")}
            type="button"
            variant="secondary"
          >
            {translate(locale, "admin.openTarget")}
          </Button>
        </div>
      </div>
    </section>
  );
}
