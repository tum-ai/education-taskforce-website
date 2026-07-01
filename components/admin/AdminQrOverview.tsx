import Link from "next/link";
import { ArrowRight, ExternalLink, KeyRound, QrCode } from "lucide-react";
import { translate, type Locale } from "@/lib/i18n/translations";
import styles from "./AdminQrOverview.module.css";

type AdminQrOverviewProps = {
  locale: Locale;
};

const qrCards = [
  {
    descriptionKey: "admin.qrOverview.langdockBody",
    href: "/admin/qr/langdock",
    icon: KeyRound,
    titleKey: "admin.qrOverview.langdockTitle",
  },
  {
    descriptionKey: "admin.qrOverview.aiDebateBody",
    href: "/admin/qr/ai-debate",
    icon: QrCode,
    titleKey: "admin.qrOverview.aiDebateTitle",
  },
  {
    descriptionKey: "admin.qrOverview.aiDebateBackupBody",
    href: "/admin/qr/ai-debate-backup",
    icon: ExternalLink,
    titleKey: "admin.qrOverview.aiDebateBackupTitle",
  },
  {
    descriptionKey: "admin.qrOverview.lovableBody",
    href: "/admin/qr/lovable",
    icon: KeyRound,
    titleKey: "admin.qrOverview.lovableTitle",
  },
] as const;

export function AdminQrOverview({ locale }: AdminQrOverviewProps) {
  return (
    <div className={styles.grid}>
      {qrCards.map((card) => {
        const Icon = card.icon;

        return (
          <Link className={styles.card} href={card.href} key={card.href}>
            <div className={styles.cardHeader}>
              <span className={styles.icon}>
                <Icon aria-hidden="true" size={22} />
              </span>
              <div>
                <h2>{translate(locale, card.titleKey)}</h2>
                <p>{translate(locale, card.descriptionKey)}</p>
              </div>
            </div>
            <span className={styles.action}>
              {translate(locale, "admin.qrOverview.open")}
              <ArrowRight aria-hidden="true" size={17} />
            </span>
          </Link>
        );
      })}
    </div>
  );
}
