import { notFound } from "next/navigation";
import { ChevronLeft, Inbox } from "lucide-react";
import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { UploadRenderer } from "@/components/preview/UploadRenderer";
import { getProgramDays, parseDayNumber } from "@/lib/domain/days";
import { requireParticipant } from "@/lib/auth/current-account";
import { listUploadsForDay } from "@/lib/data/uploads";
import { getRequestLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translations";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

type DayPageProps = {
  params: Promise<{
    dayNumber: string;
  }>;
};

export default async function DayPage({ params }: DayPageProps) {
  const locale = await getRequestLocale();
  const account = await requireParticipant();
  const { dayNumber: dayNumberParam } = await params;
  const dayNumber = parseDayNumber(dayNumberParam);

  if (!dayNumber) {
    notFound();
  }

  const day = getProgramDays(locale).find((item) => item.dayNumber === dayNumber);
  const uploads = await listUploadsForDay(account.id, dayNumber);

  return (
    <>
      <AppHeader account={account} locale={locale} />
      <main className={styles.page}>
        <section className="container" aria-labelledby="day-title">
          <Link className={styles.backLink} href="/portal">
            <ChevronLeft aria-hidden="true" size={18} />
            {translate(locale, "day.allDays")}
          </Link>
          <div className={styles.header}>
            <span>{translate(locale, "portal.day", { dayNumber })}</span>
            <h1 id="day-title">{day?.title}</h1>
            <p>{day?.description}</p>
          </div>
          {uploads.length > 0 ? (
            <div className={styles.uploads}>
              {uploads.map((upload) => (
                <UploadRenderer key={upload.id} locale={locale} upload={upload} />
              ))}
            </div>
          ) : (
            <EmptyState icon={<Inbox aria-hidden="true" size={20} />} title={translate(locale, "day.noOutcomes")}>
              {translate(locale, "day.noOutcomesBody")}
            </EmptyState>
          )}
        </section>
      </main>
    </>
  );
}
