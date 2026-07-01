import { StaticQrPanel } from "@/components/admin/StaticQrPanel";
import { AppHeader } from "@/components/layout/AppHeader";
import { requireAdmin } from "@/lib/auth/current-account";
import { getRequestLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translations";
import { createStaticQrDataUrl } from "@/lib/qr/qrcode";
import styles from "../page.module.css";

const AI_DEBATE_URL = "https://ai-debate-production-3d7d.up.railway.app/";

export const dynamic = "force-dynamic";

export default async function AdminAiDebateQrPage() {
  const locale = await getRequestLocale();
  const account = await requireAdmin();
  const qr = await createStaticQrDataUrl(AI_DEBATE_URL);

  return (
    <>
      <AppHeader account={account} locale={locale} />
      <main className={styles.page}>
        <section className="container" aria-labelledby="ai-debate-title">
          <div className={styles.header}>
            <span>{translate(locale, "admin.qrOverview.title")}</span>
            <h1 id="ai-debate-title">{translate(locale, "admin.aiDebateQr.title")}</h1>
            <p>{translate(locale, "admin.aiDebateQr.body")}</p>
          </div>
          <StaticQrPanel
            dataUrl={qr.dataUrl}
            description={translate(locale, "admin.aiDebateQr.description")}
            locale={locale}
            payload={qr.payload}
            title={translate(locale, "admin.aiDebateQr.cardTitle")}
          />
        </section>
      </main>
    </>
  );
}
