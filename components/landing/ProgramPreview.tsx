import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { PROGRAM_DAYS } from "@/lib/domain/days";
import styles from "./ProgramPreview.module.css";

export function ProgramPreview() {
  return (
    <section className={styles.section} id="program">
      <div className="container">
        <div className={styles.header}>
          <span>Program</span>
          <h2>Five days, one shared family archive.</h2>
          <p>
            Each participant account opens the same five day sections. After a session, the course team adds
            outcomes so families can revisit and download them privately.
          </p>
        </div>
        <div className={styles.grid}>
          {PROGRAM_DAYS.map((day) => (
            <article className={styles.card} key={day.dayNumber}>
              <div className={styles.number}>Day {day.dayNumber}</div>
              <h3>{day.title}</h3>
              <p>{day.description}</p>
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
