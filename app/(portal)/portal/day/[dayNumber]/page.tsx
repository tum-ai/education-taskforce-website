import { notFound } from "next/navigation";
import { ChevronLeft, Inbox } from "lucide-react";
import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { UploadRenderer } from "@/components/preview/UploadRenderer";
import { parseDayNumber, PROGRAM_DAYS } from "@/lib/domain/days";
import { requireParticipant } from "@/lib/auth/current-account";
import { listUploadsForDay } from "@/lib/data/uploads";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

type DayPageProps = {
  params: Promise<{
    dayNumber: string;
  }>;
};

export default async function DayPage({ params }: DayPageProps) {
  const account = await requireParticipant();
  const { dayNumber: dayNumberParam } = await params;
  const dayNumber = parseDayNumber(dayNumberParam);

  if (!dayNumber) {
    notFound();
  }

  const day = PROGRAM_DAYS.find((item) => item.dayNumber === dayNumber);
  const uploads = await listUploadsForDay(account.id, dayNumber);

  return (
    <>
      <AppHeader account={account} />
      <main className={styles.page}>
        <section className="container" aria-labelledby="day-title">
          <Link className={styles.backLink} href="/portal">
            <ChevronLeft aria-hidden="true" size={18} />
            All days
          </Link>
          <div className={styles.header}>
            <span>Day {dayNumber}</span>
            <h1 id="day-title">{day?.title}</h1>
            <p>{day?.description}</p>
          </div>
          {uploads.length > 0 ? (
            <div className={styles.uploads}>
              {uploads.map((upload) => (
                <UploadRenderer key={upload.id} upload={upload} />
              ))}
            </div>
          ) : (
            <EmptyState icon={<Inbox aria-hidden="true" size={20} />} title="No outcomes yet">
              The course team has not added files for this day yet.
            </EmptyState>
          )}
        </section>
      </main>
    </>
  );
}
