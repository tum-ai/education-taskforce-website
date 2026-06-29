import { AppHeader } from "@/components/layout/AppHeader";
import { UploadManagement } from "@/components/admin/UploadManagement";
import { requireAdmin } from "@/lib/auth/current-account";
import { listParticipantAccounts } from "@/lib/data/accounts";
import { listRecentUploads } from "@/lib/data/uploads";
import { uploadOutcomeFormAction } from "./actions";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function AdminUploadsPage() {
  const account = await requireAdmin();
  const [accounts, uploads] = await Promise.all([listParticipantAccounts(), listRecentUploads(10)]);

  return (
    <>
      <AppHeader account={account} />
      <main className={styles.page}>
        <section className="container" aria-labelledby="uploads-title">
          <div className={styles.header}>
            <span>Admin</span>
            <h1 id="uploads-title">Upload day outcomes.</h1>
            <p>Choose a participant account, one of the five fixed days, and a single file.</p>
          </div>
          <UploadManagement accounts={accounts} action={uploadOutcomeFormAction} uploads={uploads} />
        </section>
      </main>
    </>
  );
}
