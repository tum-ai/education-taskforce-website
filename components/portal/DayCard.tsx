import { ArrowRight, FileText } from "lucide-react";
import Link from "next/link";
import type { DayBucket } from "@/lib/domain/types";
import styles from "./DayCard.module.css";

type DayCardProps = {
  bucket: DayBucket;
};

export function DayCard({ bucket }: DayCardProps) {
  const uploadCount = bucket.uploads.length;

  return (
    <Link className={styles.card} href={`/portal/day/${bucket.dayNumber}`}>
      <div className={styles.topline}>
        <span>Day {bucket.dayNumber}</span>
        <ArrowRight aria-hidden="true" size={18} />
      </div>
      <h2>{bucket.title}</h2>
      <p>{bucket.description}</p>
      <div className={styles.meta}>
        <FileText aria-hidden="true" size={18} />
        {uploadCount === 1 ? "1 outcome" : `${uploadCount} outcomes`}
      </div>
    </Link>
  );
}
