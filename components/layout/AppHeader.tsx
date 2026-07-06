import { LogOut, Menu, Shield, UserRound } from "lucide-react";
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
  const adminLinks = [
    { href: "/admin/accounts", label: translate(locale, "nav.accounts") },
    { href: "/admin/uploads", label: translate(locale, "nav.uploads") },
    { href: "/admin/course-material", label: translate(locale, "nav.courseMaterial") },
    { href: "/admin/qr", label: translate(locale, "nav.qrCodes") },
  ];

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
              {adminLinks.map((link) => (
                <Link href={link.href} key={link.href}>
                  {link.label}
                </Link>
              ))}
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
        <details className={styles.mobileMenu}>
          <summary aria-label={translate(locale, "nav.account")}>
            <Menu aria-hidden="true" size={22} />
          </summary>
          <div className={styles.drawer}>
            <div className={styles.drawerHeader}>
              <span>{isAdmin ? translate(locale, "nav.adminOverview") : account.displayName}</span>
            </div>
            <nav className={styles.drawerNav} aria-label={translate(locale, "nav.account")}>
              {isAdmin ? (
                <>
                  <Link aria-label={translate(locale, "nav.openAdminOverview")} className={styles.account} href="/admin">
                    <Shield aria-hidden="true" size={16} />
                    {translate(locale, "nav.adminOverview")}
                  </Link>
                  {adminLinks.map((link) => (
                    <Link href={link.href} key={link.href}>
                      {link.label}
                    </Link>
                  ))}
                </>
              ) : (
                <>
                  <Link href="/portal">{translate(locale, "nav.dayOverview")}</Link>
                </>
              )}
              <LanguageToggle
                labels={{
                  english: translate(locale, "language.english"),
                  german: translate(locale, "language.german"),
                }}
                locale={locale}
              />
              <form action={signOut}>
                <Button icon={<LogOut aria-hidden="true" size={16} />} size="sm" type="submit" variant="ghost" fullWidth>
                  {translate(locale, "nav.logout")}
                </Button>
              </form>
            </nav>
          </div>
        </details>
      </div>
    </header>
  );
}
