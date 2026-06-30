import { ArrowRight, FileText } from "lucide-react";
import Link from "next/link";
import type { DayBucket } from "@/lib/domain/types";
import { translate, type Locale } from "@/lib/i18n/translations";
import styles from "./DayCard.module.css";

type DayCardProps =
  | {
      bucket: DayBucket;
      locale: Locale;
      href?: never;
      kicker?: never;
      title?: never;
      description?: never;
      meta?: never;
    }
  | {
      bucket?: never;
      locale: Locale;
      href: string;
      kicker: string;
      title: string;
      description: string;
      meta: string;
    };

export function DayCard(props: DayCardProps) {
  const href = props.bucket ? `/portal/day/${props.bucket.dayNumber}` : props.href;
  const kicker = props.bucket ? translate(props.locale, "portal.day", { dayNumber: props.bucket.dayNumber }) : props.kicker;
  const title = props.bucket ? props.bucket.title : props.title;
  const description = props.bucket ? props.bucket.description : props.description;
  const uploadCount = props.bucket ? props.bucket.uploads.length : 0;
  const meta = props.bucket
    ? uploadCount === 1
      ? translate(props.locale, "portal.oneOutcome")
      : translate(props.locale, "portal.manyOutcomes", { count: uploadCount })
    : props.meta;

  return (
    <Link className={styles.card} href={href}>
      <div className={styles.topline}>
        <span>{kicker}</span>
        <ArrowRight aria-hidden="true" size={18} />
      </div>
      <h2>{title}</h2>
      <p>{description}</p>
      <div className={styles.meta}>
        <FileText aria-hidden="true" size={18} />
        {meta}
      </div>
    </Link>
  );
}
