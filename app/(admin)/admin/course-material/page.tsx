import { CourseMaterialEditor } from "@/components/admin/CourseMaterialEditor";
import { AppHeader } from "@/components/layout/AppHeader";
import { requireAdmin } from "@/lib/auth/current-account";
import { listCourseNotes } from "@/lib/data/course-notes";
import { getRequestLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translations";
import { saveCourseMaterialAction } from "./actions";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function AdminCourseMaterialPage() {
  const locale = await getRequestLocale();
  const account = await requireAdmin();
  const notes = await listCourseNotes();

  return (
    <>
      <AppHeader account={account} locale={locale} />
      <main className={styles.page}>
        <section className="container" aria-labelledby="course-material-title">
          <div className={styles.header}>
            <span>{translate(locale, "admin.kicker")}</span>
            <h1 id="course-material-title">{translate(locale, "admin.courseMaterialTitle")}</h1>
            <p>{translate(locale, "admin.courseMaterialBody")}</p>
          </div>
          <CourseMaterialEditor locale={locale} notes={notes} saveNote={saveCourseMaterialAction} />
        </section>
      </main>
    </>
  );
}
