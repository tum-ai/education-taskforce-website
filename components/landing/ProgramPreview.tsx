import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PROGRAM_DAYS } from "@/lib/domain/days";
import styles from "./ProgramPreview.module.css";

const journeyImages = [
  {
    src: "/program/day-1-discover-ai.png",
    alt: "Teens discovering AI with abstract neural patterns around a laptop",
  },
  {
    src: "/program/day-2-prompt-lab.png",
    alt: "Teens testing prompt ideas around a creative workshop table",
  },
  {
    src: "/program/day-3-visual-stories.png",
    alt: "Teens building visual stories with AI-generated image concepts",
  },
  {
    src: "/program/day-4-web-project.png",
    alt: "Teens creating a small web project with screens and interface components",
  },
  {
    src: "/program/day-5-showcase.png",
    alt: "Teens presenting a final AI project in a small workshop showcase",
  },
];

export function ProgramPreview() {
  return (
    <section className={styles.section} id="program">
      <div className="container">
        <div className={styles.header}>
          <span>Program</span>
          <h2>A five-day AI journey for kids and teens.</h2>
          <p>
            Built for ages 12-18, the course moves from first experiments to a final project. Each step adds
            outcomes to the private portal, so students can revisit and download what they made.
          </p>
        </div>
        <div className={styles.timeline} aria-label="Five day AI journey">
          {PROGRAM_DAYS.map((day, index) => (
            <article className={styles.timelineItem} key={day.dayNumber}>
              <div className={styles.media}>
                <Image
                  alt={journeyImages[index].alt}
                  height={720}
                  priority={index === 0}
                  src={journeyImages[index].src}
                  width={1152}
                />
              </div>
              <div className={styles.marker} aria-hidden="true">
                <span>{day.dayNumber}</span>
              </div>
              <div className={styles.content}>
                <div className={styles.number}>Day {day.dayNumber}</div>
                <h3>{day.title}</h3>
                <p>{day.description}</p>
              </div>
            </article>
          ))}
        </div>
        <Link className={styles.portalLink} href="/login">
          Open the private portal
          <ArrowRight aria-hidden="true" size={18} />
        </Link>
      </div>
    </section>
  );
}
