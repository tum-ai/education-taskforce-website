import { Award, ArrowRight } from "lucide-react";
import Link from "next/link";
import { translate, type Locale } from "@/lib/i18n/translations";
import styles from "./CertificateCard.module.css";

type CertificateCardProps = {
  locale: Locale;
};

export function CertificateCard({ locale }: CertificateCardProps) {
  return (
    <Link className={styles.card} href="/portal/certificate">
      <div className={styles.icon}>
        <Award aria-hidden="true" size={26} />
      </div>
      <div className={styles.copy}>
        <span>{translate(locale, "portal.certificateKicker")}</span>
        <h2>{translate(locale, "portal.certificateTitle")}</h2>
        <p>{translate(locale, "portal.certificateDescription")}</p>
      </div>
      <span className={styles.button}>
        {translate(locale, "portal.generateCertificate")}
        <ArrowRight aria-hidden="true" size={15} />
      </span>
    </Link>
  );
}
