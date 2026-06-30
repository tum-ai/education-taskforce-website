import { findLangdockCredentialByScanToken } from "@/lib/data/langdock-credentials";
import { LangdockScanPanel } from "@/components/langdock/LangdockScanPanel";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

type LangdockScanPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function LangdockScanPage({ params }: LangdockScanPageProps) {
  const { token } = await params;
  const credential = await findLangdockCredentialByScanToken(token);

  return (
    <main className={styles.page}>
      <section className={styles.shell} aria-labelledby="langdock-scan-title">
        <div className={styles.brand}>
          <span>TUM.ai</span>
          <strong>Langdock</strong>
        </div>
        {credential ? (
          <LangdockScanPanel credential={credential} />
        ) : (
          <div className={styles.errorPanel}>
            <p>Langdock helper</p>
            <h1 id="langdock-scan-title">QR code not found</h1>
            <span>This QR code is unknown or has been replaced.</span>
          </div>
        )}
      </section>
    </main>
  );
}
