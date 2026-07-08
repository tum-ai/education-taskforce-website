"use client";

import { Download } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { createCertificatePdfFromElement } from "@/lib/browser/certificate-render";
import {
  createCertificateContent,
  createCertificateFilename,
  type CertificateLanguage,
} from "@/lib/domain/certificate";
import styles from "./CertificateDocument.module.css";

const TUM_AI_LOGO_PATH = "/brand-assets/TUM.ai logo dark purple color.svg";
const SCHLOSS_ELMAU_LOGO_PATH = "/brand-assets/Schloss-Elmau-Logo-Black.png";

type CertificateDocumentProps = {
  participantName: string;
};

export function CertificateDocument({ participantName }: CertificateDocumentProps) {
  const [language, setLanguage] = useState<CertificateLanguage>("en");
  const [isDownloading, setIsDownloading] = useState(false);
  const certificateRef = useRef<HTMLElement>(null);
  const content = useMemo(() => createCertificateContent({ language, participantName }), [language, participantName]);

  async function handleDownload() {
    if (!certificateRef.current || isDownloading) {
      return;
    }

    setIsDownloading(true);

    try {
      const pdf = await createCertificatePdfFromElement(certificateRef.current, content);
      const pdfBuffer =
        pdf.buffer instanceof ArrayBuffer
          ? pdf.buffer.slice(pdf.byteOffset, pdf.byteOffset + pdf.byteLength)
          : new Uint8Array(pdf).buffer;
      const blob = new Blob([pdfBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = createCertificateFilename(participantName, language);
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className={styles.shell}>
      <div className={styles.actions}>
        <div className={styles.languageToggle} aria-label="Certificate language">
          <button
            aria-pressed={language === "en"}
            className={language === "en" ? styles.active : ""}
            onClick={() => setLanguage("en")}
            type="button"
          >
            English
          </button>
          <button
            aria-pressed={language === "de"}
            className={language === "de" ? styles.active : ""}
            onClick={() => setLanguage("de")}
            type="button"
          >
            Deutsch
          </button>
        </div>
        <Button
          disabled={isDownloading}
          icon={<Download aria-hidden="true" size={18} />}
          onClick={handleDownload}
          type="button"
        >
          {isDownloading ? "Preparing PDF" : "Download PDF"}
        </Button>
      </div>
      <article className={styles.certificate} ref={certificateRef} aria-label={`Certificate for ${participantName}`}>
        <p className={styles.kicker}>{content.subtitle}</p>
        <h1>{content.participantName}</h1>
        <p className={styles.statement}>{content.statement}</p>
        <p className={styles.description}>{content.description}</p>
        <div className={styles.footer}>
          <div>
            <span className={styles.logoFrame}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="Schloss Elmau" src={SCHLOSS_ELMAU_LOGO_PATH} />
            </span>
            <strong>{content.courseName}</strong>
            <span>{content.footerLeft}</span>
          </div>
          <div>
            <span className={styles.logoFrame}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="TUM.ai" src={TUM_AI_LOGO_PATH} />
            </span>
            <strong>{content.organizerName}</strong>
            <span>{content.footerRight}</span>
          </div>
        </div>
      </article>
    </div>
  );
}
