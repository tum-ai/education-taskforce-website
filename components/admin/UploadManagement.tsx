"use client";

import { useActionState } from "react";
import { UploadCloud } from "lucide-react";
import type { Account, DayUpload } from "@/lib/domain/types";
import { PROGRAM_DAYS } from "@/lib/domain/days";
import type { UploadActionState } from "@/app/(admin)/admin/uploads/actions";
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
  action: (previousState: UploadActionState, formData: FormData) => Promise<UploadActionState>;
};

const initialState: UploadActionState = {
  status: "idle",
};

export function UploadManagement({ accounts, uploads, action }: UploadManagementProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <div className={styles.layout}>
      <section className={styles.panel} aria-labelledby="upload-title">
        <div className={styles.panelHeader}>
          <UploadCloud aria-hidden="true" size={20} />
          <div>
            <h2 id="upload-title">Add an outcome</h2>
            <p>Upload one image, HTML file, PDF, document, or simple downloadable file.</p>
          </div>
        </div>
        <form action={formAction} className={styles.form}>
          {state.message && state.status === "error" ? <ErrorMessage message={state.message} title="Upload failed" /> : null}
          {state.message && state.status === "success" ? (
            <div className={styles.success} role="status">
              {state.message}
            </div>
          ) : null}
          <Select error={state.fieldErrors?.accountId} label="Participant" name="accountId" required>
            <option value="">Choose account</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.displayName} ({account.username})
              </option>
            ))}
          </Select>
          <Select error={state.fieldErrors?.dayNumber} label="Day" name="dayNumber" required>
            <option value="">Choose day</option>
            {PROGRAM_DAYS.map((day) => (
              <option key={day.dayNumber} value={day.dayNumber}>
                Day {day.dayNumber}: {day.title}
              </option>
            ))}
          </Select>
          <TextInput error={state.fieldErrors?.title} label="Title" name="title" placeholder="Final image gallery" required />
          <label className={styles.fileField}>
            <span>File</span>
            <input aria-describedby="file-message" name="file" required type="file" />
            {state.fieldErrors?.file ? (
              <span className={styles.fileError} id="file-message">
                {state.fieldErrors.file}
              </span>
            ) : null}
          </label>
          <Button disabled={isPending || accounts.length === 0} icon={<UploadCloud aria-hidden="true" size={18} />} type="submit">
            {isPending ? "Uploading..." : "Upload file"}
          </Button>
        </form>
      </section>

      <section className={styles.panel} aria-labelledby="recent-uploads-title">
        <div className={styles.panelHeader}>
          <UploadCloud aria-hidden="true" size={20} />
          <div>
            <h2 id="recent-uploads-title">Recent uploads</h2>
            <p>{uploads.length === 1 ? "1 file" : `${uploads.length} files`}</p>
          </div>
        </div>
        {uploads.length > 0 ? (
          <div className={styles.uploads}>
            {uploads.map((upload) => (
              <UploadRenderer key={upload.id} upload={upload} />
            ))}
          </div>
        ) : (
          <EmptyState title="No uploads yet">Create a participant account, then upload the first day outcome.</EmptyState>
        )}
      </section>
    </div>
  );
}
