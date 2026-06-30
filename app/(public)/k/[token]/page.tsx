import { findLangdockCredentialByScanToken } from "@/lib/data/langdock-credentials";
import { LangdockScanPanel } from "@/components/langdock/LangdockScanPanel";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { getRequestLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translations";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

type LangdockScanPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function LangdockScanPage({ params }: LangdockScanPageProps) {
  const locale = await getRequestLocale();
  const { token } = await params;
  const credential = await findLangdockCredentialByScanToken(token);

  return (
    <main className={styles.page}>
      <section className={styles.shell} aria-labelledby="langdock-scan-title">
        <div className={styles.brand}>
          <span>TUM.ai</span>
          <strong>Langdock</strong>
        </div>
        <div className={styles.language}>
          <LanguageToggle
            labels={{
              english: translate(locale, "language.english"),
              german: translate(locale, "language.german"),
            }}
            locale={locale}
          />
        </div>
        {credential ? (
          <LangdockScanPanel credential={credential} locale={locale} />
        ) : (
          <div className={styles.errorPanel}>
            <p>{translate(locale, "langdock.helper")}</p>
            <h1 id="langdock-scan-title">{translate(locale, "langdock.notFound")}</h1>
            <span>{translate(locale, "langdock.notFoundBody")}</span>
          </div>
        )}
      </section>
    </main>
  );
}
