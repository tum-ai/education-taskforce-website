"use client";

import { BookOpenText, ExternalLink, FileUp, KeyRound, QrCode, UserRoundPlus, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";
import { AccountManagement } from "@/components/admin/AccountManagement";
import { CourseMaterialEditor } from "@/components/admin/CourseMaterialEditor";
import { LangdockCredentialManagement, type CredentialImportActionState } from "@/components/admin/LangdockCredentialManagement";
import { StaticQrPanel } from "@/components/admin/StaticQrPanel";
import { UploadManagement } from "@/components/admin/UploadManagement";
import { Button } from "@/components/ui/Button";
import type { AccountActionState, CredentialActionResult } from "@/app/(admin)/admin/accounts/actions";
import type { PrepareUploadResult, UploadActionState } from "@/app/(admin)/admin/uploads/actions";
import { DEFAULT_LANGDOCK_LOGIN_URL, parseLangdockCredentialsCsv, type LangdockCredentialCard } from "@/lib/domain/langdock";
import { DEFAULT_LOVABLE_LOGIN_URL, parseLovableCredentialsCsv } from "@/lib/domain/lovable";
import type { CourseNote, CourseNoteSaveInput } from "@/lib/domain/course-material";
import { DAY_NUMBERS, type Account, type DayUpload } from "@/lib/domain/types";
import { translate, type Locale } from "@/lib/i18n/translations";
import styles from "./AdminPreview.module.css";

type PreviewView = "overview" | "accounts" | "uploads" | "course-material" | "qr";

const locale: Locale = "en";
const previewOrigin = "http://127.0.0.1:3000";

const fixtureAccounts: Account[] = [
  {
    createdAt: "2026-07-01T09:00:00.000Z",
    displayName: "Ada Lovelace",
    id: "preview-account-ada",
    role: "participant",
    temporaryPassword: "preview-ada-3819",
    username: "ada-lovelace",
  },
  {
    createdAt: "2026-07-01T09:15:00.000Z",
    displayName: "Grace Hopper",
    id: "preview-account-grace",
    role: "participant",
    temporaryPassword: null,
    username: "grace-hopper",
  },
];

const fixtureUploads: DayUpload[] = [
  {
    accountId: "preview-account-ada",
    contentType: "application/pdf",
    createdAt: "2026-07-03T15:00:00.000Z",
    dayNumber: 3,
    fileSizeBytes: 238000,
    fileType: "pdf",
    id: "preview-upload-pdf",
    originalFilename: "ai-storyboard.pdf",
    storagePath: "preview/ai-storyboard.pdf",
    title: "AI storyboard",
  },
  {
    accountId: "preview-account-grace",
    contentType: "application/zip",
    createdAt: "2026-07-04T14:30:00.000Z",
    dayNumber: 4,
    fileSizeBytes: 812000,
    fileType: "other",
    id: "preview-upload-zip",
    originalFilename: "web-project.zip",
    storagePath: "preview/web-project.zip",
    title: "Web project archive",
  },
];

const fixtureNotes: CourseNote[] = DAY_NUMBERS.flatMap((dayNumber) => [
  {
    ageGroup: "younger",
    dayNumber,
    markdown: `# Day ${dayNumber} facilitator notes\n\n## Goals\n\n- Keep the activity concrete and visual.\n- Let participants compare AI outputs.\n\n## Flow\n\n1. Warm-up\n2. Guided build\n3. Reflection`,
    updatedAt: "2026-07-02T12:00:00.000Z",
  },
  {
    ageGroup: "older",
    dayNumber,
    markdown: `# Day ${dayNumber} advanced notes\n\n## Goals\n\n- Connect prompts to evaluation criteria.\n- Let teams document tradeoffs.\n\n## Flow\n\n1. Concept input\n2. Team challenge\n3. Showcase`,
    updatedAt: "2026-07-02T12:20:00.000Z",
  },
]);

function createPreviewQrDataUrl(label: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220"><rect width="220" height="220" fill="white"/><rect x="16" y="16" width="52" height="52" fill="#1b0049"/><rect x="28" y="28" width="28" height="28" fill="white"/><rect x="152" y="16" width="52" height="52" fill="#1b0049"/><rect x="164" y="28" width="28" height="28" fill="white"/><rect x="16" y="152" width="52" height="52" fill="#1b0049"/><rect x="28" y="164" width="28" height="28" fill="white"/><path d="M88 20h14v14H88zm28 0h14v14h-14zm-28 28h42v14H88zm0 42h14v14H88zm28 0h14v14h-14zm28 0h14v14h-14zm42 0h14v14h-14zM88 118h28v14H88zm42 0h14v14h-14zm28 0h42v14h-42zM88 146h14v14H88zm28 0h42v14h-42zm56 0h28v14h-28zM88 174h42v14H88zm56 0h14v14h-14zm28 0h28v14h-28z" fill="#1b0049"/><text x="110" y="210" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#523573">${label}</text></svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function createFixtureCredential(displayName: string, username: string): CredentialActionResult {
  return {
    accountId: `preview-account-${username}`,
    displayName,
    qrDataUrl: createPreviewQrDataUrl(username),
    qrPayload: `${previewOrigin}/login?username=${encodeURIComponent(username)}`,
    temporaryPassword: `preview-${username.slice(0, 8)}-1234`,
    username,
  };
}

function createCredentialCards(prefix: "langdock" | "lovable", labels: string[]): LangdockCredentialCard[] {
  return labels.map((label, index) => ({
    createdAt: "2026-07-02T10:00:00.000Z",
    device: `Device ${index + 1}`,
    email: `${label.toLowerCase().replace(/\s+/g, ".")}@example.com`,
    group: "Blue",
    id: `${prefix}-${index + 1}`,
    label,
    loginUrl: prefix === "langdock" ? DEFAULT_LANGDOCK_LOGIN_URL : DEFAULT_LOVABLE_LOGIN_URL,
    password: "preview-password",
    qrDataUrl: createPreviewQrDataUrl(`${prefix}-${index + 1}`),
    qrPayload: `${previewOrigin}/${prefix === "langdock" ? "k" : "lovable-k"}/preview-${index + 1}`,
    updatedAt: "2026-07-02T10:00:00.000Z",
  }));
}

const fixtureLangdockCards = createCredentialCards("langdock", ["Ada", "Grace"]);
const fixtureLovableCards = createCredentialCards("lovable", ["Alan", "Katherine"]);

async function previewCreateParticipantAction(
  _previousState: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const displayName = String(formData.get("displayName") || "Preview Participant").trim();
  const username =
    String(formData.get("username") || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || displayName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  return {
    credential: createFixtureCredential(displayName, username || "preview-participant"),
    message: translate(locale, "admin.participantCreated"),
    status: "success",
  };
}

async function previewResetPasswordAction(
  _previousState: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const accountId = String(formData.get("accountId") ?? "");
  const account = fixtureAccounts.find((item) => item.id === accountId) ?? fixtureAccounts[0];

  return {
    credential: createFixtureCredential(account.displayName, account.username),
    message: translate(locale, "admin.passwordReset"),
    status: "success",
  };
}

async function previewPrepareUploadAction(): Promise<PrepareUploadResult> {
  return {
    message: "Preview only: configure Supabase to upload real files.",
    status: "error",
  };
}

async function previewFinalizeUploadAction(): Promise<UploadActionState> {
  return {
    message: "Preview only: configure Supabase to save uploads.",
    status: "error",
  };
}

async function previewSaveCourseNoteAction(
  input: CourseNoteSaveInput & { locale?: Locale },
): Promise<{ note: CourseNote; status: "success"; message: string }> {
  return {
    message: translate(input.locale ?? locale, "admin.courseMaterialSaved"),
    note: {
      ageGroup: input.ageGroup,
      dayNumber: input.dayNumber,
      markdown: input.markdown,
      updatedAt: new Date().toISOString(),
    },
    status: "success",
  };
}

function createImportAction(
  kind: "langdock" | "lovable",
): (_previousState: CredentialImportActionState, formData: FormData) => Promise<CredentialImportActionState> {
  return async (_previousState, formData) => {
    const csv = String(formData.get("csv") ?? "");
    const defaultLoginUrl = String(
      formData.get("defaultLoginUrl") ?? (kind === "langdock" ? DEFAULT_LANGDOCK_LOGIN_URL : DEFAULT_LOVABLE_LOGIN_URL),
    );
    const parsed =
      kind === "langdock"
        ? parseLangdockCredentialsCsv(csv, { defaultLoginUrl })
        : parseLovableCredentialsCsv(csv, { defaultLoginUrl });

    if (parsed.errors.length > 0) {
      return {
        errors: parsed.errors,
        message: translate(locale, "admin.importBlocked"),
        status: "error",
      };
    }

    const credentials: LangdockCredentialCard[] = parsed.credentials.map((credential, index) => ({
      ...credential,
      createdAt: new Date().toISOString(),
      id: `${kind}-preview-import-${index + 1}`,
      qrDataUrl: createPreviewQrDataUrl(`${kind}-${index + 1}`),
      qrPayload: `${previewOrigin}/${kind === "langdock" ? "k" : "lovable-k"}/preview-import-${index + 1}`,
      updatedAt: new Date().toISOString(),
    }));

    return {
      credentials,
      message:
        credentials.length === 1
          ? translate(locale, kind === "langdock" ? "admin.importedLangdockOne" : "admin.importedLovableOne")
          : translate(locale, kind === "langdock" ? "admin.importedLangdockMany" : "admin.importedLovableMany", {
              count: credentials.length,
            }),
      status: "success",
    };
  };
}

const previewViews: Array<{ id: PreviewView; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "accounts", label: "Accounts" },
  { id: "uploads", label: "Uploads" },
  { id: "course-material", label: "Course material" },
  { id: "qr", label: "QR tools" },
];

export function AdminPreview() {
  const [activeView, setActiveView] = useState<PreviewView>("overview");
  const filledBuckets = useMemo(
    () => new Set(fixtureUploads.map((upload) => `${upload.accountId}:${upload.dayNumber}`)),
    [],
  );
  const emptyBucketCount = fixtureAccounts.length * DAY_NUMBERS.length - filledBuckets.size;

  return (
    <main className={styles.page}>
      <section className="container" aria-labelledby="admin-preview-title">
        <div className={styles.header}>
          <span>Development</span>
          <h1 id="admin-preview-title">Admin preview</h1>
          <p>Fixture-backed admin screens for local layout checks.</p>
        </div>

        <div className={styles.tabs} aria-label="Admin preview sections">
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

        {activeView === "overview" ? (
          <PreviewOverview
            emptyBucketCount={Math.max(emptyBucketCount, 0)}
            onSelectView={setActiveView}
            participantCount={fixtureAccounts.length}
            uploadCount={fixtureUploads.length}
          />
        ) : null}

        {activeView === "accounts" ? (
          <AccountManagement
            accounts={fixtureAccounts}
            createAction={previewCreateParticipantAction}
            locale={locale}
            resetAction={previewResetPasswordAction}
          />
        ) : null}

        {activeView === "uploads" ? (
          <UploadManagement
            accounts={fixtureAccounts}
            finalizeAction={previewFinalizeUploadAction}
            locale={locale}
            prepareAction={previewPrepareUploadAction}
            uploads={fixtureUploads}
          />
        ) : null}

        {activeView === "course-material" ? (
          <CourseMaterialEditor locale={locale} notes={fixtureNotes} saveNote={previewSaveCourseNoteAction} />
        ) : null}

        {activeView === "qr" ? <PreviewQrTools /> : null}
      </section>
    </main>
  );
}

function PreviewOverview({
  emptyBucketCount,
  onSelectView,
  participantCount,
  uploadCount,
}: {
  emptyBucketCount: number;
  onSelectView: (view: PreviewView) => void;
  participantCount: number;
  uploadCount: number;
}) {
  return (
    <>
      <div className={styles.stats} aria-label={translate(locale, "admin.summary")}>
        <article>
          <UsersRound aria-hidden="true" size={22} />
          <strong>{participantCount}</strong>
          <span>{translate(locale, "admin.participantAccounts")}</span>
        </article>
        <article>
          <FileUp aria-hidden="true" size={22} />
          <strong>{uploadCount}</strong>
          <span>{translate(locale, "admin.recentUploads")}</span>
        </article>
        <article>
          <FileUp aria-hidden="true" size={22} />
          <strong>{emptyBucketCount}</strong>
          <span>{translate(locale, "admin.emptyDayBuckets")}</span>
        </article>
      </div>
      <div className={styles.actions}>
        <Button icon={<UserRoundPlus aria-hidden="true" size={18} />} onClick={() => onSelectView("accounts")}>
          {translate(locale, "admin.manageAccounts")}
        </Button>
        <Button icon={<FileUp aria-hidden="true" size={18} />} onClick={() => onSelectView("uploads")} variant="secondary">
          {translate(locale, "admin.uploadOutcomes")}
        </Button>
        <Button
          icon={<BookOpenText aria-hidden="true" size={18} />}
          onClick={() => onSelectView("course-material")}
          variant="secondary"
        >
          {translate(locale, "admin.courseMaterial")}
        </Button>
        <Button icon={<QrCode aria-hidden="true" size={18} />} onClick={() => onSelectView("qr")} variant="secondary">
          {translate(locale, "nav.qrCodes")}
        </Button>
      </div>
    </>
  );
}

function PreviewQrTools() {
  const langdockImportAction = useMemo(() => createImportAction("langdock"), []);
  const lovableImportAction = useMemo(() => createImportAction("lovable"), []);

  return (
    <div className={styles.qrStack}>
      <div className={styles.qrGrid}>
        <StaticQrPanel
          dataUrl={createPreviewQrDataUrl("ai-debate")}
          description={translate(locale, "admin.aiDebateQr.description")}
          locale={locale}
          payload="https://ai-debate-production-3d7d.up.railway.app/"
          title={translate(locale, "admin.aiDebateQr.cardTitle")}
        />
        <StaticQrPanel
          dataUrl={createPreviewQrDataUrl("hacking-tool")}
          description={translate(locale, "admin.aiDebateBackupQr.description")}
          locale={locale}
          payload="https://project-firewall-production.up.railway.app/"
          title={translate(locale, "admin.aiDebateBackupQr.cardTitle")}
        />
      </div>
      <section className={styles.qrSection} aria-labelledby="preview-langdock-title">
        <div className={styles.sectionHeader}>
          <KeyRound aria-hidden="true" size={20} />
          <div>
            <h2 id="preview-langdock-title">{translate(locale, "admin.langdockTitle")}</h2>
            <p>{translate(locale, "admin.langdockBody")}</p>
          </div>
        </div>
        <LangdockCredentialManagement
          credentials={fixtureLangdockCards}
          detectedOrigin={previewOrigin}
          importAction={langdockImportAction}
          locale={locale}
        />
      </section>
      <section className={styles.qrSection} aria-labelledby="preview-lovable-title">
        <div className={styles.sectionHeader}>
          <ExternalLink aria-hidden="true" size={20} />
          <div>
            <h2 id="preview-lovable-title">{translate(locale, "admin.lovableTitle")}</h2>
            <p>{translate(locale, "admin.lovableBody")}</p>
          </div>
        </div>
        <LangdockCredentialManagement
          credentials={fixtureLovableCards}
          defaultLoginUrl={DEFAULT_LOVABLE_LOGIN_URL}
          detectedOrigin={previewOrigin}
          importAction={lovableImportAction}
          labels={{
            cardAltPrefix: "Lovable QR code for",
            defaultLoginUrl: translate(locale, "admin.defaultLovableUrl"),
            importBody: translate(locale, "admin.importLovableBody"),
            importTitle: translate(locale, "admin.importLovable"),
            loginFallback: translate(locale, "admin.lovableLogin"),
            noCardsBody: translate(locale, "admin.noLovableCardsBody"),
            noCardsTitle: translate(locale, "admin.noLovableCards"),
          }}
          locale={locale}
          sampleCsv={`label,email,password,group,device\nAlan,alan@example.com,example-password,Orange,iPad 3\nKatherine,katherine@example.com,example-password,Orange,iPad 4`}
          textareaId="lovable-csv"
        />
      </section>
    </div>
  );
}
