import { QrCode } from "lucide-react";
import { LangdockCredentialManagement } from "@/components/admin/LangdockCredentialManagement";
import { AppHeader } from "@/components/layout/AppHeader";
import { requireAdmin } from "@/lib/auth/current-account";
import { listLangdockCredentialCards } from "@/lib/data/langdock-credentials";
import type { LangdockCredentialCard } from "@/lib/domain/langdock";
import { getRequestLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translations";
import { getCurrentRequestOrigin } from "@/lib/qr/origin";
import { importLangdockCredentialsFormAction } from "./actions";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function AdminLangdockPage() {
  const locale = await getRequestLocale();
  const account = await requireAdmin();
  const origin = await getCurrentRequestOrigin();
  let credentials: LangdockCredentialCard[] = [];
  let loadError: string | undefined;

  try {
    credentials = await listLangdockCredentialCards(origin);
  } catch (error) {
    loadError = error instanceof Error ? error.message : translate(locale, "admin.couldNotLoadLangdock");
  }

  return (
    <>
      <AppHeader account={account} locale={locale} />
      <main className={styles.page}>
        <section className="container" aria-labelledby="langdock-title">
          <div className={styles.header}>
            <span>{translate(locale, "admin.kicker")}</span>
            <h1 id="langdock-title">{translate(locale, "admin.langdockTitle")}</h1>
            <p>{translate(locale, "admin.langdockBody")}</p>
          </div>
          <div className={styles.summary}>
            <QrCode aria-hidden="true" size={22} />
            <strong>{credentials.length}</strong>
            <span>{translate(locale, credentials.length === 1 ? "admin.credential" : "admin.credentials")}</span>
          </div>
          <LangdockCredentialManagement
            credentials={credentials}
            detectedOrigin={origin}
            importAction={importLangdockCredentialsFormAction}
            locale={locale}
            loadError={loadError}
          />
        </section>
      </main>
    </>
  );
}
