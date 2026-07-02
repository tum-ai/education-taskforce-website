import { LogOut, Shield, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Account } from "@/lib/domain/types";
import { translate, type Locale } from "@/lib/i18n/translations";
import { signOut } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import styles from "./AppHeader.module.css";

const TUMAI_LOGO_SRC = "/brand-assets/TUM.ai%20logo%20dark%20purple%20color.svg";
const SCHLOSS_ELMAU_LOGO_SRC = "/brand-assets/Schloss-Elmau-Logo-Black.png";

type AppHeaderProps = {
  account: Account;
  locale: Locale;
};

export function AppHeader({ account, locale }: AppHeaderProps) {
  const isAdmin = account.role === "admin";

  return (
    <header className={styles.header}>
      <div className={`${styles.inner} container`}>
        <Link aria-label={translate(locale, "nav.home")} className={styles.brand} href="/">
          <Image alt="TUM.ai" className={styles.tumaiLogo} height={41} priority src={TUMAI_LOGO_SRC} width={164} />
          <Image
            alt="Schloss Elmau"
            className={styles.elmauLogo}
            height={42}
            priority
            src={SCHLOSS_ELMAU_LOGO_SRC}
            width={42}
          />
        </Link>
        <nav className={styles.nav} aria-label={translate(locale, "nav.account")}>
          {isAdmin ? (
            <>
              <Link href="/admin/accounts">{translate(locale, "nav.accounts")}</Link>
              <Link href="/admin/uploads">{translate(locale, "nav.uploads")}</Link>
              <Link href="/admin/course-material">{translate(locale, "nav.courseMaterial")}</Link>
              <Link href="/admin/qr">{translate(locale, "nav.qrCodes")}</Link>
            </>
          ) : (
            <Link href="/portal">{translate(locale, "nav.dayOverview")}</Link>
          )}
          {isAdmin ? (
            <Link aria-label={translate(locale, "nav.openAdminOverview")} className={styles.account} href="/admin">
              <Shield aria-hidden="true" size={16} />
              {translate(locale, "nav.adminOverview")}
            </Link>
          ) : (
            <span className={styles.account}>
              <UserRound aria-hidden="true" size={16} />
              {account.displayName}
            </span>
          )}
          <LanguageToggle
            labels={{
              english: translate(locale, "language.english"),
              german: translate(locale, "language.german"),
            }}
            locale={locale}
          />
          <form action={signOut}>
            <Button icon={<LogOut aria-hidden="true" size={16} />} size="sm" type="submit" variant="ghost">
              {translate(locale, "nav.logout")}
            </Button>
          </form>
        </nav>
      </div>
    </header>
  );
}
