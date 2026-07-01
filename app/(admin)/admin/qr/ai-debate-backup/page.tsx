import { StaticQrPanel } from "@/components/admin/StaticQrPanel";
import { AppHeader } from "@/components/layout/AppHeader";
import { requireAdmin } from "@/lib/auth/current-account";
import { getRequestLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translations";
import { createStaticQrDataUrl } from "@/lib/qr/qrcode";
import styles from "../page.module.css";

const HACKING_TOOL_URL = "https://project-firewall-production.up.railway.app/";

export const dynamic = "force-dynamic";

export default async function AdminAiDebateBackupQrPage() {
  const locale = await getRequestLocale();
  const account = await requireAdmin();
  const qr = await createStaticQrDataUrl(HACKING_TOOL_URL);

  return (
    <>
      <AppHeader account={account} locale={locale} />
      <main className={styles.page}>
        <section className="container" aria-labelledby="ai-debate-backup-title">
          <div className={styles.header}>
            <span>{translate(locale, "admin.qrOverview.title")}</span>
            <h1 id="ai-debate-backup-title">{translate(locale, "admin.aiDebateBackupQr.title")}</h1>
            <p>{translate(locale, "admin.aiDebateBackupQr.body")}</p>
          </div>
          <StaticQrPanel
            dataUrl={qr.dataUrl}
            description={translate(locale, "admin.aiDebateBackupQr.description")}
            locale={locale}
            payload={qr.payload}
            title={translate(locale, "admin.aiDebateBackupQr.cardTitle")}
          />
        </section>
      </main>
    </>
  );
}
