import { LogOut, Shield, UserRound } from "lucide-react";
import Link from "next/link";
import type { Account } from "@/lib/domain/types";
import { signOut } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";
import styles from "./AppHeader.module.css";

type AppHeaderProps = {
  account: Account;
};

export function AppHeader({ account }: AppHeaderProps) {
  const isAdmin = account.role === "admin";

  return (
    <header className={styles.header}>
      <div className={`${styles.inner} container`}>
        <Link className={styles.brand} href={isAdmin ? "/admin" : "/portal"}>
          <span className={styles.mark}>TUM.ai</span>
          <span>AI Edutainment</span>
        </Link>
        <nav className={styles.nav} aria-label="Account navigation">
          {isAdmin ? (
            <>
              <Link href="/admin/accounts">Accounts</Link>
              <Link href="/admin/uploads">Uploads</Link>
              <Link href="/admin/langdock">Langdock QR</Link>
            </>
          ) : (
            <Link href="/portal">Portal</Link>
          )}
          <span className={styles.account}>
            {isAdmin ? <Shield aria-hidden="true" size={16} /> : <UserRound aria-hidden="true" size={16} />}
            {account.displayName}
          </span>
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
