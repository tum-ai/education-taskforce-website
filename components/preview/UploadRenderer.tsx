/* eslint-disable @next/next/no-img-element */
import { Code2, Download, FileArchive, FileImage, FileText } from "lucide-react";
import type { DayUpload } from "@/lib/domain/types";
import { LinkButton } from "@/components/ui/Button";
import styles from "./UploadRenderer.module.css";

type UploadRendererProps = {
  upload: DayUpload;
};

const iconByType = {
  image: FileImage,
  html: Code2,
  pdf: FileText,
  document: FileText,
  other: FileArchive,
};

export function UploadRenderer({ upload }: UploadRendererProps) {
  const downloadHref = `/api/download/${upload.id}`;
  const Icon = iconByType[upload.fileType];

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div className={styles.icon}>
          <Icon aria-hidden="true" size={20} />
        </div>
        <div>
          <h2>{upload.title}</h2>
          <p>{upload.originalFilename}</p>
        </div>
      </div>

      {upload.fileType === "image" ? (
        <img className={styles.image} src={`${downloadHref}?preview=1`} alt={upload.title} />
      ) : null}

      {upload.fileType === "html" ? (
        <div className={styles.previewShell}>
          <iframe
            className={styles.iframe}
            sandbox="allow-scripts"
            src={`/api/preview/${upload.id}`}
            title={upload.title}
          />
        </div>
      ) : null}

      <div className={styles.actions}>
        <LinkButton href={downloadHref} icon={<Download aria-hidden="true" size={18} />} size="sm" variant="secondary">
          {upload.fileType === "html" ? "Download source" : "Download"}
        </LinkButton>
      </div>
    </article>
  );
}
