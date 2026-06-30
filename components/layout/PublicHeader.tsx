import { LogIn } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";
import styles from "./PublicHeader.module.css";

const TUMAI_LOGO_SRC = "/brand-assets/TUM.ai%20logo%20white%20color.svg";
const SCHLOSS_ELMAU_LOGO_SRC = "/brand-assets/Schloss-Elmau-Logo.png";
const SCHLOSS_ELMAU_URL = "https://www.schloss-elmau.de/";

export function PublicHeader() {
  return (
    <header className={styles.header}>
      <div className={`${styles.inner} container`}>
        <Link aria-label="TUM.ai home" className={styles.brand} href="/">
          <Image
            alt="TUM.ai"
            className={styles.tumaiLogo}
            height={41}
            priority
            src={TUMAI_LOGO_SRC}
            width={164}
          />
        </Link>
        <a
          aria-label="Open the official Schloss Elmau website"
          className={styles.centerLogo}
          href={SCHLOSS_ELMAU_URL}
          rel="noopener noreferrer"
          target="_blank"
        >
          <Image alt="Schloss Elmau" height={52} priority src={SCHLOSS_ELMAU_LOGO_SRC} width={52} />
        </a>
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
