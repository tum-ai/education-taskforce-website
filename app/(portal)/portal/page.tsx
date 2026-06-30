import { AppHeader } from "@/components/layout/AppHeader";
import { DayCard } from "@/components/portal/DayCard";
import { createDayBuckets } from "@/lib/domain/days";
import { requireParticipant } from "@/lib/auth/current-account";
import { listUploadsForAccount } from "@/lib/data/uploads";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function PortalPage() {
  const account = await requireParticipant();
  const uploads = await listUploadsForAccount(account.id);
  const buckets = createDayBuckets(uploads);

  return (
    <>
      <AppHeader account={account} />
      <main className={styles.page}>
        <section className="container" aria-labelledby="portal-title">
          <div className={styles.header}>
            <span>Your course archive</span>
            <h1 id="portal-title">Five days from AI Edutainment.</h1>
            <p>Open a day to see the images, pages, documents, and projects saved for your account.</p>
          </div>
          <div className={styles.grid}>
            {buckets.map((bucket) => (
              <DayCard bucket={bucket} key={bucket.dayNumber} />
            ))}
            <DayCard
              href="/"
              kicker="TUM.ai"
              title="Who we are"
              description="We are a student initiative from the Technical University of Munich helping young people explore AI through hands-on projects, creativity, and responsible technology."
              meta="Back to landing page"
            />
          </div>
        </section>
      </main>
    </>
  );
}
