import { BookOpenText, FileUp, QrCode, UserRoundPlus, UsersRound } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { LinkButton } from "@/components/ui/Button";
import { requireAdmin } from "@/lib/auth/current-account";
import { listParticipantAccounts } from "@/lib/data/accounts";
import { listRecentUploads } from "@/lib/data/uploads";
import { DAY_NUMBERS } from "@/lib/domain/types";
import { getRequestLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translations";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const locale = await getRequestLocale();
  const account = await requireAdmin();
  const [participants, uploads] = await Promise.all([listParticipantAccounts(), listRecentUploads(12)]);
  const filledBuckets = new Set(uploads.map((upload) => `${upload.accountId}:${upload.dayNumber}`));
  const emptyBucketCount = participants.length * DAY_NUMBERS.length - filledBuckets.size;

  return (
    <>
      <AppHeader account={account} locale={locale} />
      <main className={styles.page}>
        <section className="container" aria-labelledby="admin-title">
          <div className={styles.header}>
            <span>{translate(locale, "admin.kicker")}</span>
            <h1 id="admin-title">{translate(locale, "admin.title")}</h1>
            <p>{translate(locale, "admin.body")}</p>
          </div>
          <div className={styles.stats} aria-label={translate(locale, "admin.summary")}>
            <article>
              <UsersRound aria-hidden="true" size={22} />
              <strong>{participants.length}</strong>
              <span>{translate(locale, "admin.participantAccounts")}</span>
            </article>
            <article>
              <FileUp aria-hidden="true" size={22} />
              <strong>{uploads.length}</strong>
              <span>{translate(locale, "admin.recentUploads")}</span>
            </article>
            <article>
              <FileUp aria-hidden="true" size={22} />
              <strong>{Math.max(emptyBucketCount, 0)}</strong>
              <span>{translate(locale, "admin.emptyDayBuckets")}</span>
            </article>
          </div>
          <div className={styles.actions}>
            <LinkButton href="/admin/accounts" icon={<UserRoundPlus aria-hidden="true" size={18} />}>
              {translate(locale, "admin.manageAccounts")}
            </LinkButton>
            <LinkButton href="/admin/uploads" icon={<FileUp aria-hidden="true" size={18} />} variant="secondary">
              {translate(locale, "admin.uploadOutcomes")}
            </LinkButton>
            <LinkButton
              href="/admin/course-material"
              icon={<BookOpenText aria-hidden="true" size={18} />}
              variant="secondary"
            >
              {translate(locale, "admin.courseMaterial")}
            </LinkButton>
            <LinkButton href="/admin/qr" icon={<QrCode aria-hidden="true" size={18} />} variant="secondary">
              {translate(locale, "nav.qrCodes")}
            </LinkButton>
          </div>
        </section>
      </main>
    </>
  );
}
