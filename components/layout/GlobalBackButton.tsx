"use client";

import { ArrowLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import styles from "./GlobalBackButton.module.css";

export function GlobalBackButton() {
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
    <button aria-label="Go back" className={styles.backButton} onClick={goBack} type="button">
      <ArrowLeft aria-hidden="true" size={16} />
      <span>Back</span>
    </button>
  );
}
