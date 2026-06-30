import { PublicHeader } from "@/components/layout/PublicHeader";
import { LinkButton } from "@/components/ui/Button";
import { getRequestLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translations";
import styles from "./not-found.module.css";

export default async function NotFound() {
  const locale = await getRequestLocale();

  return (
    <>
      <PublicHeader locale={locale} />
      <main className={styles.page}>
        <section className="container">
          <span>404</span>
          <h1>{translate(locale, "notFound.title")}</h1>
          <p>{translate(locale, "notFound.body")}</p>
          <LinkButton href="/login">{translate(locale, "notFound.login")}</LinkButton>
        </section>
      </main>
    </>
  );
}
