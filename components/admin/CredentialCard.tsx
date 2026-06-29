/* eslint-disable @next/next/no-img-element */
import type { CredentialActionResult } from "@/app/(admin)/admin/accounts/actions";
import styles from "./CredentialCard.module.css";

type CredentialCardProps = {
  credential: CredentialActionResult;
  onDismiss?: () => void;
};

export function CredentialCard({ credential, onDismiss }: CredentialCardProps) {
  return (
    <section className={styles.card} aria-label={`Credentials for ${credential.displayName}`}>
      <div className={styles.header}>
        <div>
          <span>One-time credential</span>
          <h2>{credential.displayName}</h2>
        </div>
        {onDismiss ? (
          <button className={styles.dismiss} onClick={onDismiss} type="button">
            Dismiss
          </button>
        ) : null}
      </div>
      <div className={styles.body}>
        <img alt={`QR login code for ${credential.username}`} height={180} src={credential.qrDataUrl} width={180} />
        <dl>
          <div>
            <dt>Username</dt>
            <dd>{credential.username}</dd>
          </div>
          <div>
            <dt>Temporary password</dt>
            <dd>{credential.temporaryPassword}</dd>
          </div>
          <div>
            <dt>QR link</dt>
            <dd>{credential.qrPayload}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
