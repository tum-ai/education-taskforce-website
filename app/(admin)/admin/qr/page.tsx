import { AdminQrOverview } from "@/components/admin/AdminQrOverview";
import { AppHeader } from "@/components/layout/AppHeader";
import { requireAdmin } from "@/lib/auth/current-account";
import { getRequestLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translations";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function AdminQrPage() {
  const locale = await getRequestLocale();
  const account = await requireAdmin();

  return (
    <>
      <AppHeader account={account} locale={locale} />
      <main className={styles.page}>
        <section className="container" aria-labelledby="qr-overview-title">
          <div className={styles.header}>
            <span>{translate(locale, "admin.kicker")}</span>
            <h1 id="qr-overview-title">{translate(locale, "admin.qrOverview.title")}</h1>
            <p>{translate(locale, "admin.qrOverview.body")}</p>
          </div>
          <AdminQrOverview locale={locale} />
        </section>
      </main>
    </>
  );
}
