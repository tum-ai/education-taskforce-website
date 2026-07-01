import { LangdockScanPanel } from "@/components/langdock/LangdockScanPanel";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { findLovableCredentialByScanToken } from "@/lib/data/lovable-credentials";
import { getRequestLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translations";
import styles from "../../k/[token]/page.module.css";

export const dynamic = "force-dynamic";

type LovableScanPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function LovableScanPage({ params }: LovableScanPageProps) {
  const locale = await getRequestLocale();
  const { token } = await params;
  const credential = await findLovableCredentialByScanToken(token);

  return (
    <main className={styles.page}>
      <section className={styles.shell} aria-labelledby="langdock-scan-title">
        <div className={styles.brand}>
          <span>TUM.ai</span>
          <strong>Lovable</strong>
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
          <LangdockScanPanel
            credential={credential}
            labels={{
              assignedLogin: translate(locale, "lovable.assignedLogin"),
              email: translate(locale, "lovable.email"),
              open: translate(locale, "lovable.open"),
              password: translate(locale, "lovable.password"),
            }}
            locale={locale}
          />
        ) : (
          <div className={styles.errorPanel}>
            <p>{translate(locale, "lovable.helper")}</p>
            <h1 id="langdock-scan-title">{translate(locale, "lovable.notFound")}</h1>
            <span>{translate(locale, "lovable.notFoundBody")}</span>
          </div>
        )}
      </section>
    </main>
  );
}
