import Link from "next/link";
import { translate, type Locale } from "@/lib/i18n/translations";
import styles from "./Footer.module.css";

type FooterProps = {
  locale: Locale;
};

export function Footer({ locale }: FooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.gridOverlay} />

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.top}>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="Logo" className={styles.logo} height="32" src="/assets/tum_ai_logo_new.svg" width="128" />
            </div>
            <div className={styles.linksGrid}>
              <div className={styles.column}>
                <p className={styles.heading}>{translate(locale, "footer.connect")}</p>
                <ul className={styles.list}>
                  <li>
                    <a
                      aria-label="LinkedIn"
                      className={styles.link}
                      href="https://de.linkedin.com/company/tum-ai"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      LinkedIn
                    </a>
                  </li>
                  <li>
                    <a
                      aria-label="Instagram"
                      className={styles.link}
                      href="https://www.instagram.com/tum.ai_official/"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      Instagram
                    </a>
                  </li>
                  <li>
                    <a
                      aria-label="Slack"
                      className={styles.link}
                      href="https://join.slack.com/t/tumaipublic/shared_invite/zt-10kg0t1f9-JLRXDxY_d_vprKWgab0cVw"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      Slack
                    </a>
                  </li>
                  <li>
                    <a
                      aria-label="Email"
                      className={styles.link}
                      href="mailto:contact@tum-ai.com"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      Email
                    </a>
                  </li>
                </ul>
              </div>
              <div className={styles.column}>
                <p className={styles.heading}>{translate(locale, "footer.legal")}</p>
                <ul className={styles.list}>
                  <li>
                    <Link className={styles.link} href="/imprint">
                      {translate(locale, "footer.imprint")}
                    </Link>
                  </li>
                  <li>
                    <Link className={styles.link} href="/data-privacy">
                      {translate(locale, "footer.dataPrivacy")}
                    </Link>
                  </li>
                  <li>
                    <Link className={styles.link} href="/disclaimer">
                      {translate(locale, "footer.disclaimer")}
                    </Link>
                  </li>
                </ul>
              </div>
              <div className={styles.column}>
                <p className={styles.heading}>{translate(locale, "footer.contribute")}</p>
                <ul className={styles.list}>
                  <li>
                    <a
                      className={styles.link}
                      href="https://github.com/tum-ai/"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      GitHub
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className={styles.bottom}>
            <p>{translate(locale, "footer.bottom")}</p>
          </div>
        </div>
      </section>
    </footer>
  );
}
