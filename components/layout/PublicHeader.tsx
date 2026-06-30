import { LogIn } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { translate, type Locale } from "@/lib/i18n/translations";
import { LinkButton } from "@/components/ui/Button";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import styles from "./PublicHeader.module.css";

const TUMAI_LOGO_SRC = "/brand-assets/TUM.ai%20logo%20white%20color.svg";
const SCHLOSS_ELMAU_LOGO_SRC = "/brand-assets/Schloss-Elmau-Logo.png";
const SCHLOSS_ELMAU_URL = "https://www.schloss-elmau.de/";

type PublicHeaderProps = {
  locale: Locale;
};

export function PublicHeader({ locale }: PublicHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={`${styles.inner} container`}>
        <Link aria-label={translate(locale, "nav.tumaiHome")} className={styles.brand} href="/">
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
          aria-label={translate(locale, "nav.schlossWebsite")}
          className={styles.centerLogo}
          href={SCHLOSS_ELMAU_URL}
          rel="noopener noreferrer"
          target="_blank"
        >
          <Image alt="Schloss Elmau" height={52} priority src={SCHLOSS_ELMAU_LOGO_SRC} width={52} />
        </a>
        <nav aria-label={translate(locale, "nav.public")}>
          <LanguageToggle
            labels={{
              english: translate(locale, "language.english"),
              german: translate(locale, "language.german"),
            }}
            locale={locale}
          />
          <LinkButton
            className={styles.loginButton}
            href="/login"
            icon={<LogIn aria-hidden="true" size={18} />}
            size="sm"
            variant="secondary"
          >
            {translate(locale, "nav.login")}
          </LinkButton>
        </nav>
      </div>
    </header>
  );
}
