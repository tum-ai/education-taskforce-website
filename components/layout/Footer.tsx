import Link from "next/link";
import styles from "./Footer.module.css";

export function Footer() {
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
                <p className={styles.heading}>Connect</p>
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
                <p className={styles.heading}>Legal</p>
                <ul className={styles.list}>
                  <li>
                    <Link className={styles.link} href="/imprint">
                      Imprint
                    </Link>
                  </li>
                  <li>
                    <Link className={styles.link} href="/data-privacy">
                      Data Privacy
                    </Link>
                  </li>
                  <li>
                    <Link className={styles.link} href="/disclaimer">
                      Disclaimer
                    </Link>
                  </li>
                </ul>
              </div>
              <div className={styles.column}>
                <p className={styles.heading}>Contribute</p>
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
            <p>TUM.ai - Student Initiative at Technical University of Munich</p>
          </div>
        </div>
      </section>
    </footer>
  );
}
