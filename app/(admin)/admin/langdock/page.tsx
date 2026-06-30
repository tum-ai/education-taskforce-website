import { QrCode } from "lucide-react";
import { LangdockCredentialManagement } from "@/components/admin/LangdockCredentialManagement";
import { AppHeader } from "@/components/layout/AppHeader";
import { requireAdmin } from "@/lib/auth/current-account";
import { listLangdockCredentialCards } from "@/lib/data/langdock-credentials";
import type { LangdockCredentialCard } from "@/lib/domain/langdock";
import { getCurrentRequestOrigin } from "@/lib/qr/origin";
import { importLangdockCredentialsFormAction } from "./actions";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function AdminLangdockPage() {
  const account = await requireAdmin();
  const origin = await getCurrentRequestOrigin();
  let credentials: LangdockCredentialCard[] = [];
  let loadError: string | undefined;

  try {
    credentials = await listLangdockCredentialCards(origin);
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Could not load Langdock credentials.";
  }

  return (
    <>
      <AppHeader account={account} />
      <main className={styles.page}>
        <section className="container" aria-labelledby="langdock-title">
          <div className={styles.header}>
            <span>Admin</span>
            <h1 id="langdock-title">Langdock QR supplier.</h1>
            <p>Import Langdock accounts and print QR cards that open this hosted site.</p>
          </div>
          <div className={styles.summary}>
            <QrCode aria-hidden="true" size={22} />
            <strong>{credentials.length}</strong>
            <span>{credentials.length === 1 ? "credential" : "credentials"}</span>
          </div>
          <LangdockCredentialManagement
            credentials={credentials}
            detectedOrigin={origin}
            importAction={importLangdockCredentialsFormAction}
            loadError={loadError}
          />
        </section>
      </main>
    </>
  );
}
