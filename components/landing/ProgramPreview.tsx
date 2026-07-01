import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getProgramDays } from "@/lib/domain/days";
import { translate, type Locale } from "@/lib/i18n/translations";
import styles from "./ProgramPreview.module.css";

const journeyImages = [
  {
    src: "/program/AI-picure.jpg",
    alt: "Large AI letters on a pink background",
    format: "square",
    objectPosition: "56% 50%",
  },
  {
    src: "/program/code-picture.jpg",
    alt: "Close-up of code on a screen",
    format: "square",
    objectPosition: "50% 50%",
  },
  {
    src: "/program/videogame-picture.png",
    alt: "Students presenting a self-built video game in a mountain workshop room",
    format: "square",
    objectPosition: "50% 48%",
  },
  {
    src: "/program/webproject-pricture.png",
    alt: "Students building a web project together at a table in the mountains",
    format: "square",
    objectPosition: "50% 50%",
  },
  {
    src: "/program/presentation-picture.png",
    alt: "Students presenting a game project to the group",
    format: "square",
    objectPosition: "50% 46%",
  },
];

type ProgramPreviewProps = {
  locale: Locale;
};

export function ProgramPreview({ locale }: ProgramPreviewProps) {
  const days = getProgramDays(locale);

  return (
    <section className={styles.section} id="program">
      <div className="container">
        <div className={styles.header}>
          <span>{translate(locale, "landing.program.kicker")}</span>
          <h2>{translate(locale, "landing.program.title")}</h2>
          <p>{translate(locale, "landing.program.body")}</p>
        </div>
        <div className={styles.timeline} aria-label={translate(locale, "landing.program.timeline")}>
          {days.map((day, index) => (
            <article className={styles.timelineItem} key={day.dayNumber}>
              <div className={`${styles.media} ${journeyImages[index].format === "wide" ? styles.mediaWide : ""}`}>
                <Image
                  alt={journeyImages[index].alt}
                  height={720}
                  priority={index === 0}
                  src={journeyImages[index].src}
                  style={{ objectPosition: journeyImages[index].objectPosition }}
                  width={1152}
                />
              </div>
              <div className={styles.marker} aria-hidden="true">
                <span>{day.dayNumber}</span>
              </div>
              <div className={styles.content}>
                <div className={styles.number}>{translate(locale, "portal.day", { dayNumber: day.dayNumber })}</div>
                <h3>{day.title}</h3>
                <p>{day.description}</p>
              </div>
            </article>
          ))}
        </div>
        <Link className={styles.portalLink} href="/login">
          {translate(locale, "landing.program.portal")}
          <ArrowRight aria-hidden="true" size={18} />
        </Link>
      </div>
    </section>
  );
}
