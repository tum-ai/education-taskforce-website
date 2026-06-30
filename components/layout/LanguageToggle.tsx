"use client";

import { useRouter } from "next/navigation";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n/translations";
import styles from "./LanguageToggle.module.css";

type LanguageToggleProps = {
  locale: Locale;
  labels: {
    english: string;
    german: string;
  };
};

export function LanguageToggle({ locale, labels }: LanguageToggleProps) {
  const router = useRouter();

  function setLocale(nextLocale: Locale) {
    if (nextLocale === locale) {
      return;
    }

    document.cookie = `${LOCALE_COOKIE}=${nextLocale}; Max-Age=31536000; Path=/; SameSite=Lax`;
    router.refresh();
  }

  return (
    <div className={styles.toggle} aria-label="Language">
      <button
        aria-label={labels.english}
        aria-pressed={locale === "en"}
        onClick={() => setLocale("en")}
        title={labels.english}
        type="button"
      >
        EN
      </button>
      <button
        aria-label={labels.german}
        aria-pressed={locale === "de"}
        onClick={() => setLocale("de")}
        title={labels.german}
        type="button"
      >
        DE
      </button>
    </div>
  );
}
