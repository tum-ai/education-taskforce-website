import { AppHeader } from "@/components/layout/AppHeader";
import { AccountManagement } from "@/components/admin/AccountManagement";
import { requireAdmin } from "@/lib/auth/current-account";
import { listParticipantAccounts } from "@/lib/data/accounts";
import { getRequestLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translations";
import { createParticipantFormAction, resetParticipantPasswordFormAction } from "./actions";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function AdminAccountsPage() {
  const locale = await getRequestLocale();
  const account = await requireAdmin();
  const accounts = await listParticipantAccounts();

  return (
    <>
      <AppHeader account={account} locale={locale} />
      <main className={styles.page}>
        <section className="container" aria-labelledby="accounts-title">
          <div className={styles.header}>
            <span>{translate(locale, "admin.kicker")}</span>
            <h1 id="accounts-title">{translate(locale, "admin.accountsTitle")}</h1>
            <p>{translate(locale, "admin.accountsBody")}</p>
          </div>
          <AccountManagement
            accounts={accounts}
            createAction={createParticipantFormAction}
            locale={locale}
            resetAction={resetParticipantPasswordFormAction}
          />
        </section>
      </main>
    </>
  );
}
