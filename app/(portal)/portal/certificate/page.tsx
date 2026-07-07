import { CertificateDocument } from "@/components/portal/CertificateDocument";
import { AppHeader } from "@/components/layout/AppHeader";
import { requireParticipant } from "@/lib/auth/current-account";
import { getRequestLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translations";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function CertificatePage() {
  const locale = await getRequestLocale();
  const account = await requireParticipant();

  return (
    <>
      <AppHeader account={account} locale={locale} />
      <main className={styles.page}>
        <section className="container" aria-labelledby="certificate-title">
          <div className={styles.header}>
            <span>{translate(locale, "portal.certificateKicker")}</span>
            <h1 id="certificate-title">{translate(locale, "certificate.pageTitle")}</h1>
            <p>{translate(locale, "certificate.pageBody")}</p>
          </div>
          <CertificateDocument participantName={account.displayName} />
        </section>
      </main>
    </>
  );
}
