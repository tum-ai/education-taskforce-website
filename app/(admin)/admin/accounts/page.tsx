import { AppHeader } from "@/components/layout/AppHeader";
import { AccountManagement } from "@/components/admin/AccountManagement";
import { requireAdmin } from "@/lib/auth/current-account";
import { listParticipantAccounts } from "@/lib/data/accounts";
import { createParticipantFormAction, resetParticipantPasswordFormAction } from "./actions";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function AdminAccountsPage() {
  const account = await requireAdmin();
  const accounts = await listParticipantAccounts();

  return (
    <>
      <AppHeader account={account} />
      <main className={styles.page}>
        <section className="container" aria-labelledby="accounts-title">
          <div className={styles.header}>
            <span>Admin</span>
            <h1 id="accounts-title">Accounts and QR cards.</h1>
            <p>Create participant accounts, reset temporary passwords, and generate QR login cards.</p>
          </div>
          <AccountManagement
            accounts={accounts}
            createAction={createParticipantFormAction}
            resetAction={resetParticipantPasswordFormAction}
          />
        </section>
      </main>
    </>
  );
}
