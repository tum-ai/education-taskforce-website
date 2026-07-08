"use client";

import { Award, FileText } from "lucide-react";
import { useMemo, useState } from "react";
import { CertificateDocument } from "@/components/portal/CertificateDocument";
import { createDayBuckets } from "@/lib/domain/days";
import type { DayUpload } from "@/lib/domain/types";
import { translate, type Locale } from "@/lib/i18n/translations";
import styles from "./ParticipantPreview.module.css";

type PreviewView = "certificate" | "overview";

const locale: Locale = "en";

const fixtureUploads: DayUpload[] = [
  {
    accountId: "preview-participant",
    contentType: "application/pdf",
    createdAt: "2026-07-03T15:00:00.000Z",
    dayNumber: 3,
    fileSizeBytes: 238000,
    fileType: "pdf",
    id: "preview-participant-upload-pdf",
    originalFilename: "ai-storyboard.pdf",
    storagePath: "preview/ai-storyboard.pdf",
    title: "AI storyboard",
  },
  {
    accountId: "preview-participant",
    contentType: "application/zip",
    createdAt: "2026-07-04T14:30:00.000Z",
    dayNumber: 4,
    fileSizeBytes: 812000,
    fileType: "other",
    id: "preview-participant-upload-zip",
    originalFilename: "web-project.zip",
    storagePath: "preview/web-project.zip",
    title: "Web project archive",
  },
];

const previewViews: Array<{ id: PreviewView; label: string }> = [
  { id: "certificate", label: "Certificate" },
  { id: "overview", label: "Participant overview" },
];

export function ParticipantPreview() {
  const [activeView, setActiveView] = useState<PreviewView>("certificate");
  const [participantName, setParticipantName] = useState("Ada Lovelace");
  const buckets = useMemo(() => createDayBuckets(fixtureUploads, locale), []);
  const safeParticipantName = participantName.trim() || "Preview Participant";

  return (
    <main className={styles.page}>
      <section className="container" aria-labelledby="participant-preview-title">
        <div className={styles.header}>
          <span>Development</span>
          <h1 id="participant-preview-title">Participant preview</h1>
          <p>Fixture-backed participant screens for local certificate and portal checks.</p>
        </div>

        <div className={styles.tabs} aria-label="Participant preview sections">
          {previewViews.map((view) => (
            <button
              aria-pressed={activeView === view.id}
              className={activeView === view.id ? styles.activeTab : ""}
              key={view.id}
              onClick={() => setActiveView(view.id)}
              type="button"
            >
              {view.label}
            </button>
          ))}
        </div>

        {activeView === "certificate" ? (
          <div className={styles.certificateView}>
            <label className={styles.nameField}>
              <span>Participant name</span>
              <input
                onChange={(event) => setParticipantName(event.target.value)}
                placeholder="Participant name"
                type="text"
                value={participantName}
              />
            </label>
            <CertificateDocument participantName={safeParticipantName} />
          </div>
        ) : null}

        {activeView === "overview" ? (
          <div className={styles.overviewGrid}>
            {buckets.map((bucket) => (
              <article className={styles.dayCard} key={bucket.dayNumber}>
                <span>{translate(locale, "portal.day", { dayNumber: bucket.dayNumber })}</span>
                <h2>{bucket.title}</h2>
                <p>{bucket.shortDescription ?? bucket.description}</p>
                <div className={styles.cardMeta}>
                  <FileText aria-hidden="true" size={16} />
                  {bucket.uploads.length === 1
                    ? translate(locale, "portal.oneOutcome")
                    : translate(locale, "portal.manyOutcomes", { count: bucket.uploads.length })}
                </div>
              </article>
            ))}
            <article className={`${styles.dayCard} ${styles.certificateCard}`}>
              <Award aria-hidden="true" size={26} />
              <span>{translate(locale, "portal.certificateKicker")}</span>
              <h2>{translate(locale, "portal.certificateTitle")}</h2>
              <p>{translate(locale, "portal.certificateDescription")}</p>
              <button onClick={() => setActiveView("certificate")} type="button">
                {translate(locale, "portal.generateCertificate")}
              </button>
            </article>
          </div>
        ) : null}
      </section>
    </main>
  );
}
