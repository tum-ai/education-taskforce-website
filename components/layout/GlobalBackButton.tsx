"use client";

import { ArrowLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { translate, type Locale } from "@/lib/i18n/translations";
import styles from "./GlobalBackButton.module.css";

type GlobalBackButtonProps = {
  locale: Locale;
};

export function GlobalBackButton({ locale }: GlobalBackButtonProps) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/") {
    return null;
  }

  function goBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  }

  return (
    <button aria-label={translate(locale, "nav.back")} className={styles.backButton} onClick={goBack} type="button">
      <ArrowLeft aria-hidden="true" size={16} />
      <span>{translate(locale, "nav.back")}</span>
    </button>
  );
}
