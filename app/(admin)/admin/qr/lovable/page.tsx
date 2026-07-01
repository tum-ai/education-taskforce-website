import { QrCode } from "lucide-react";
import { LangdockCredentialManagement } from "@/components/admin/LangdockCredentialManagement";
import { AppHeader } from "@/components/layout/AppHeader";
import { requireAdmin } from "@/lib/auth/current-account";
import { listLovableCredentialCards } from "@/lib/data/lovable-credentials";
import { DEFAULT_LOVABLE_LOGIN_URL, type LovableCredentialCard } from "@/lib/domain/lovable";
import { getRequestLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translations";
import { getCurrentRequestOrigin } from "@/lib/qr/origin";
import { importLovableCredentialsFormAction } from "./actions";
import styles from "../page.module.css";

const sampleCsv = `label,email,password,group,device
Ada,ada@example.com,example-password,Blue,iPad 1
Ben,ben@example.com,example-password,Blue,iPad 2`;

export const dynamic = "force-dynamic";

export default async function AdminQrLovablePage() {
  const locale = await getRequestLocale();
  const account = await requireAdmin();
  const origin = await getCurrentRequestOrigin();
  let credentials: LovableCredentialCard[] = [];
  let loadError: string | undefined;

  try {
    credentials = await listLovableCredentialCards(origin);
  } catch (error) {
    loadError = error instanceof Error ? error.message : translate(locale, "admin.couldNotLoadLovable");
  }

  return (
    <>
      <AppHeader account={account} locale={locale} />
      <main className={styles.page}>
        <section className="container" aria-labelledby="lovable-title">
          <div className={styles.header}>
            <span>{translate(locale, "admin.qrOverview.title")}</span>
            <h1 id="lovable-title">{translate(locale, "admin.lovableTitle")}</h1>
            <p>{translate(locale, "admin.lovableBody")}</p>
          </div>
          <div className={styles.summary}>
            <QrCode aria-hidden="true" size={22} />
            <strong>{credentials.length}</strong>
            <span>{translate(locale, credentials.length === 1 ? "admin.credential" : "admin.credentials")}</span>
          </div>
          <LangdockCredentialManagement
            credentials={credentials}
            defaultLoginUrl={DEFAULT_LOVABLE_LOGIN_URL}
            detectedOrigin={origin}
            importAction={importLovableCredentialsFormAction}
            labels={{
              cardAltPrefix: "Lovable QR code for",
              defaultLoginUrl: translate(locale, "admin.defaultLovableUrl"),
              importBody: translate(locale, "admin.importLovableBody"),
              importTitle: translate(locale, "admin.importLovable"),
              loginFallback: translate(locale, "admin.lovableLogin"),
              noCardsBody: translate(locale, "admin.noLovableCardsBody"),
              noCardsTitle: translate(locale, "admin.noLovableCards"),
            }}
            locale={locale}
            loadError={loadError}
            sampleCsv={sampleCsv}
            textareaId="lovable-csv"
          />
        </section>
      </main>
    </>
  );
}
