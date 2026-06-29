import { LogIn } from "lucide-react";
import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";
import styles from "./PublicHeader.module.css";

export function PublicHeader() {
  return (
    <header className={styles.header}>
      <div className={`${styles.inner} container`}>
        <Link className={styles.brand} href="/">
          <span className={styles.mark}>TUM.ai</span>
          <span>Schloss Elmau</span>
        </Link>
        <nav aria-label="Public navigation">
          <LinkButton
            className={styles.loginButton}
            href="/login"
            icon={<LogIn aria-hidden="true" size={18} />}
            size="sm"
            variant="secondary"
          >
            Log in
          </LinkButton>
        </nav>
      </div>
    </header>
  );
}
