import { FileUp, UserRoundPlus, UsersRound } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { LinkButton } from "@/components/ui/Button";
import { requireAdmin } from "@/lib/auth/current-account";
import { listParticipantAccounts } from "@/lib/data/accounts";
import { listRecentUploads } from "@/lib/data/uploads";
import { DAY_NUMBERS } from "@/lib/domain/types";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const account = await requireAdmin();
  const [participants, uploads] = await Promise.all([listParticipantAccounts(), listRecentUploads(12)]);
  const filledBuckets = new Set(uploads.map((upload) => `${upload.accountId}:${upload.dayNumber}`));
  const emptyBucketCount = participants.length * DAY_NUMBERS.length - filledBuckets.size;

  return (
    <>
      <AppHeader account={account} />
      <main className={styles.page}>
        <section className="container" aria-labelledby="admin-title">
          <div className={styles.header}>
            <span>Admin</span>
            <h1 id="admin-title">Course operations.</h1>
            <p>Create participant accounts, prepare QR credentials, and add daily outcomes.</p>
          </div>
          <div className={styles.stats} aria-label="Admin summary">
            <article>
              <UsersRound aria-hidden="true" size={22} />
              <strong>{participants.length}</strong>
              <span>participant accounts</span>
            </article>
            <article>
              <FileUp aria-hidden="true" size={22} />
              <strong>{uploads.length}</strong>
              <span>recent uploads</span>
            </article>
            <article>
              <FileUp aria-hidden="true" size={22} />
              <strong>{Math.max(emptyBucketCount, 0)}</strong>
              <span>empty day buckets</span>
            </article>
          </div>
          <div className={styles.actions}>
            <LinkButton href="/admin/accounts" icon={<UserRoundPlus aria-hidden="true" size={18} />}>
              Manage accounts
            </LinkButton>
            <LinkButton href="/admin/uploads" icon={<FileUp aria-hidden="true" size={18} />} variant="secondary">
              Upload outcomes
            </LinkButton>
          </div>
        </section>
      </main>
    </>
  );
}
