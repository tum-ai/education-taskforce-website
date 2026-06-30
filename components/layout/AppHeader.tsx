import { LogOut, Shield, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Account } from "@/lib/domain/types";
import { signOut } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";
import styles from "./AppHeader.module.css";

const TUMAI_LOGO_SRC = "/brand-assets/TUM.ai%20logo%20dark%20purple%20color.svg";
const SCHLOSS_ELMAU_LOGO_SRC = "/brand-assets/Schloss-Elmau-Logo-Black.png";

type AppHeaderProps = {
  account: Account;
};

export function AppHeader({ account }: AppHeaderProps) {
  const isAdmin = account.role === "admin";

  return (
    <header className={styles.header}>
      <div className={`${styles.inner} container`}>
        <Link aria-label="Back to landing page" className={styles.brand} href="/">
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
        <nav className={styles.nav} aria-label="Account navigation">
          {isAdmin ? (
            <>
              <Link href="/admin/accounts">Accounts</Link>
              <Link href="/admin/uploads">Uploads</Link>
              <Link href="/admin/langdock">Langdock QR</Link>
            </>
          ) : (
            <Link href="/portal">Day overview</Link>
          )}
          {isAdmin ? (
            <Link aria-label="Open admin overview" className={styles.account} href="/admin">
              <Shield aria-hidden="true" size={16} />
              Admin overview
            </Link>
          ) : (
            <span className={styles.account}>
              <UserRound aria-hidden="true" size={16} />
              {account.displayName}
            </span>
          )}
          <form action={signOut}>
            <Button icon={<LogOut aria-hidden="true" size={16} />} size="sm" type="submit" variant="ghost">
              Sign out
            </Button>
          </form>
        </nav>
      </div>
    </header>
  );
}
