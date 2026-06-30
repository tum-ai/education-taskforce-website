/* eslint-disable @next/next/no-img-element */
import type { CredentialActionResult } from "@/app/(admin)/admin/accounts/actions";
import { translate, type Locale } from "@/lib/i18n/translations";
import styles from "./CredentialCard.module.css";

type CredentialCardProps = {
  credential: CredentialActionResult;
  locale: Locale;
  onDismiss?: () => void;
};

export function CredentialCard({ credential, locale, onDismiss }: CredentialCardProps) {
  return (
    <section className={styles.card} aria-label={`Credentials for ${credential.displayName}`}>
      <div className={styles.header}>
        <div>
          <span>{translate(locale, "admin.oneTimeCredential")}</span>
          <h2>{credential.displayName}</h2>
        </div>
        {onDismiss ? (
          <button className={styles.dismiss} onClick={onDismiss} type="button">
            {translate(locale, "admin.dismiss")}
          </button>
        ) : null}
      </div>
      <div className={styles.body}>
        <img alt={`QR login code for ${credential.username}`} height={180} src={credential.qrDataUrl} width={180} />
        <dl>
          <div>
            <dt>{translate(locale, "admin.username")}</dt>
            <dd>{credential.username}</dd>
          </div>
          <div>
            <dt>{translate(locale, "admin.temporaryPassword")}</dt>
            <dd>{credential.temporaryPassword}</dd>
          </div>
          <div>
            <dt>{translate(locale, "admin.qrLink")}</dt>
            <dd>{credential.qrPayload}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
