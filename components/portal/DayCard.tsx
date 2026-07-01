import { ArrowRight, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { DayBucket } from "@/lib/domain/types";
import { translate, type Locale } from "@/lib/i18n/translations";
import styles from "./DayCard.module.css";

const dayImages = {
  1: { objectPosition: "56% 50%", src: "/program/AI-picure.jpg" },
  2: { objectPosition: "50% 50%", src: "/program/code-picture.jpg" },
  3: { objectPosition: "50% 48%", src: "/program/videogame-picture.png" },
  4: { objectPosition: "50% 50%", src: "/program/webproject-pricture.png" },
  5: { objectPosition: "50% 46%", src: "/program/presentation-picture.png" },
} as const;

const tumaiLogoSrc = "/brand-assets/TUM.ai%20logo%20dark%20purple%20color.svg";

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
  const isDayCard = Boolean(props.bucket);
  const href = props.bucket ? `/portal/day/${props.bucket.dayNumber}` : props.href;
  const isExternal = href.startsWith("http");
  const kicker = props.bucket ? translate(props.locale, "portal.day", { dayNumber: props.bucket.dayNumber }) : props.kicker;
  const title = props.bucket ? props.bucket.title : props.title;
  const description = props.bucket ? (props.bucket.shortDescription ?? props.bucket.description) : props.description;
  const image = props.bucket ? dayImages[props.bucket.dayNumber] : undefined;
  const imageSrc = image?.src ?? tumaiLogoSrc;
  const uploadCount = props.bucket ? props.bucket.uploads.length : 0;
  const meta = props.bucket
    ? uploadCount === 1
      ? translate(props.locale, "portal.oneOutcome")
      : translate(props.locale, "portal.manyOutcomes", { count: uploadCount })
    : props.meta;
  const actionLabel = isDayCard ? translate(props.locale, "portal.viewOutcomes") : translate(props.locale, "portal.learnMore");

  return (
    <Link
      className={`${styles.card} ${isDayCard ? "" : styles.brandCard}`}
      href={href}
      rel={isExternal ? "noopener noreferrer" : undefined}
      target={isExternal ? "_blank" : undefined}
    >
      <div className={styles.media}>
        <Image
          alt=""
          className={styles.image}
          fill
          priority={props.bucket?.dayNumber === 1}
          sizes="(max-width: 760px) calc(100vw - 24px), 548px"
          src={imageSrc}
          style={image ? { objectPosition: image.objectPosition } : undefined}
        />
        <span className={styles.kicker}>{kicker}</span>
      </div>
      <div className={styles.content}>
        <h2>{title}</h2>
        <p>{description}</p>
        <div className={styles.footer}>
          <span className={styles.meta}>
            <FileText aria-hidden="true" size={16} />
            {meta}
          </span>
          <span className={styles.button}>
            {actionLabel}
            <ArrowRight aria-hidden="true" size={15} />
          </span>
        </div>
      </div>
    </Link>
  );
}
