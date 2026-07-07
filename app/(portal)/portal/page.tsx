import { AppHeader } from "@/components/layout/AppHeader";
import { CertificateCard } from "@/components/portal/CertificateCard";
import { DayCard } from "@/components/portal/DayCard";
import { createDayBuckets } from "@/lib/domain/days";
import { requireParticipant } from "@/lib/auth/current-account";
import { listUploadsForAccount } from "@/lib/data/uploads";
import { getRequestLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translations";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function PortalPage() {
  const locale = await getRequestLocale();
  const account = await requireParticipant();
  const uploads = await listUploadsForAccount(account.id);
  const buckets = createDayBuckets(uploads, locale);

  return (
    <>
      <AppHeader account={account} locale={locale} />
      <main className={styles.page}>
        <section className="container" aria-labelledby="portal-title">
          <div className={styles.header}>
            <span>{translate(locale, "portal.kicker")}</span>
            <h1 id="portal-title">{translate(locale, "portal.title")}</h1>
            <p>{translate(locale, "portal.body")}</p>
          </div>
          <div className={styles.grid}>
            {buckets.map((bucket) => (
              <DayCard bucket={bucket} key={bucket.dayNumber} locale={locale} />
            ))}
            <DayCard
              href="https://www.tum-ai.com/"
              kicker={translate(locale, "portal.whoKicker")}
              title={translate(locale, "portal.whoTitle")}
              description={translate(locale, "portal.whoDescription")}
              meta={translate(locale, "portal.whoMeta")}
              locale={locale}
            />
            <CertificateCard locale={locale} />
          </div>
        </section>
      </main>
    </>
  );
}
