import { AppHeader } from "@/components/layout/AppHeader";
import { UploadManagement } from "@/components/admin/UploadManagement";
import { requireAdmin } from "@/lib/auth/current-account";
import { listParticipantAccounts } from "@/lib/data/accounts";
import { listRecentUploads } from "@/lib/data/uploads";
import { getRequestLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translations";
import { finalizeUploadAction, prepareUploadAction } from "./actions";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function AdminUploadsPage() {
  const locale = await getRequestLocale();
  const account = await requireAdmin();
  const [accounts, uploads] = await Promise.all([listParticipantAccounts(), listRecentUploads(10)]);

  return (
    <>
      <AppHeader account={account} locale={locale} />
      <main className={styles.page}>
        <section className="container" aria-labelledby="uploads-title">
          <div className={styles.header}>
            <span>{translate(locale, "admin.kicker")}</span>
            <h1 id="uploads-title">{translate(locale, "admin.uploadsTitle")}</h1>
            <p>{translate(locale, "admin.uploadsBody")}</p>
          </div>
          <UploadManagement
            accounts={accounts}
            finalizeAction={finalizeUploadAction}
            locale={locale}
            prepareAction={prepareUploadAction}
            uploads={uploads}
          />
        </section>
      </main>
    </>
  );
}
