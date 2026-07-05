"use client";

import { useState, type FormEvent } from "react";
import { UploadCloud } from "lucide-react";
import type { Account, DayUpload } from "@/lib/domain/types";
import { getProgramDays } from "@/lib/domain/days";
import { translate, type Locale } from "@/lib/i18n/translations";
import type {
  PrepareUploadResult,
  UploadActionState,
  UploadMetadataInput,
} from "@/app/(admin)/admin/uploads/actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { PARTICIPANT_UPLOADS_BUCKET } from "@/lib/storage/paths";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Select } from "@/components/ui/Select";
import { TextInput } from "@/components/ui/TextInput";
import { UploadRenderer } from "@/components/preview/UploadRenderer";
import styles from "./UploadManagement.module.css";

type UploadManagementProps = {
  accounts: Account[];
  uploads: DayUpload[];
  prepareAction: (input: UploadMetadataInput) => Promise<PrepareUploadResult>;
  finalizeAction: (input: UploadMetadataInput & { uploadId: string }) => Promise<UploadActionState>;
  locale: Locale;
};

const initialState: UploadActionState = {
  status: "idle",
};

export function UploadManagement({ accounts, uploads, prepareAction, finalizeAction, locale }: UploadManagementProps) {
  const [state, setState] = useState<UploadActionState>(initialState);
  const [isPending, setIsPending] = useState(false);
  const days = getProgramDays(locale);

  // The file goes straight from the browser to Supabase Storage: server-action
  // bodies are size-capped (1 MB default, ~4.5 MB on Vercel), so only metadata
  // may pass through the prepare/finalize actions.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("file");

    setIsPending(true);
    setState(initialState);

    try {
      if (!(file instanceof File) || !file.name) {
        setState({ status: "error", fieldErrors: { file: translate(locale, "admin.chooseFile") } });
        return;
      }

      const metadata: UploadMetadataInput = {
        locale,
        accountId: String(formData.get("accountId") ?? ""),
        dayNumber: String(formData.get("dayNumber") ?? ""),
        title: String(formData.get("title") ?? ""),
        fileName: file.name,
        fileSize: file.size,
        fileMimeType: file.type,
      };

      const prepared = await prepareAction(metadata);
      if (prepared.status !== "ready") {
        setState(prepared);
        return;
      }

      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.storage
        .from(PARTICIPANT_UPLOADS_BUCKET)
        .uploadToSignedUrl(prepared.storagePath, prepared.uploadToken, file, {
          contentType: file.type || "application/octet-stream",
        });

      if (error) {
        setState({ status: "error", message: translate(locale, "admin.couldNotUploadFile") });
        return;
      }

      const result = await finalizeAction({ ...metadata, uploadId: prepared.uploadId });
      setState(result);

      if (result.status === "success") {
        form.reset();
      }
    } catch {
      setState({ status: "error", message: translate(locale, "admin.couldNotUploadFile") });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className={styles.layout}>
      <section className={styles.panel} aria-labelledby="upload-title">
        <div className={styles.panelHeader}>
          <UploadCloud aria-hidden="true" size={20} />
          <div>
            <h2 id="upload-title">{translate(locale, "admin.addOutcome")}</h2>
            <p>{translate(locale, "admin.addOutcomeBody")}</p>
          </div>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          {state.message && state.status === "error" ? (
            <ErrorMessage message={state.message} title={translate(locale, "admin.uploadFailed")} />
          ) : null}
          {state.message && state.status === "success" ? (
            <div className={styles.success} role="status">
              {state.message}
            </div>
          ) : null}
          <Select error={state.fieldErrors?.accountId} label={translate(locale, "admin.participant")} name="accountId" required>
            <option value="">{translate(locale, "admin.chooseAccount")}</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.displayName} ({account.username})
              </option>
            ))}
          </Select>
          <Select error={state.fieldErrors?.dayNumber} label={translate(locale, "admin.day")} name="dayNumber" required>
            <option value="">{translate(locale, "admin.chooseDay")}</option>
            {days.map((day) => (
              <option key={day.dayNumber} value={day.dayNumber}>
                {translate(locale, "portal.day", { dayNumber: day.dayNumber })}: {day.title}
              </option>
            ))}
          </Select>
          <TextInput
            error={state.fieldErrors?.title}
            label={translate(locale, "admin.titleField")}
            name="title"
            placeholder="Final image gallery"
            required
          />
          <label className={styles.fileField}>
            <span>{translate(locale, "admin.file")}</span>
            <input aria-describedby="file-message" name="file" required type="file" />
            {state.fieldErrors?.file ? (
              <span className={styles.fileError} id="file-message">
                {state.fieldErrors.file}
              </span>
            ) : null}
          </label>
          <Button disabled={isPending || accounts.length === 0} icon={<UploadCloud aria-hidden="true" size={18} />} type="submit">
            {isPending ? translate(locale, "admin.uploading") : translate(locale, "admin.uploadFile")}
          </Button>
        </form>
      </section>

      <section className={styles.panel} aria-labelledby="recent-uploads-title">
        <div className={styles.panelHeader}>
          <UploadCloud aria-hidden="true" size={20} />
          <div>
            <h2 id="recent-uploads-title">{translate(locale, "admin.recentUploads")}</h2>
            <p>
              {uploads.length === 1
                ? translate(locale, "admin.fileCountOne")
                : translate(locale, "admin.fileCountMany", { count: uploads.length })}
            </p>
          </div>
        </div>
        {uploads.length > 0 ? (
          <div className={styles.uploads}>
            {uploads.map((upload) => (
              <UploadRenderer key={upload.id} locale={locale} upload={upload} />
            ))}
          </div>
        ) : (
          <EmptyState title={translate(locale, "admin.noUploads")}>{translate(locale, "admin.noUploadsBody")}</EmptyState>
        )}
      </section>
    </div>
  );
}
