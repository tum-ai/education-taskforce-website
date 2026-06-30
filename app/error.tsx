"use client";

import { useEffect, useState } from "react";
import { RotateCw } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/Button";
import { DEFAULT_LOCALE, LOCALE_COOKIE, normalizeLocale, translate, type Locale } from "@/lib/i18n/translations";
import styles from "./error.module.css";

function readLocaleCookie(): Locale {
  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${LOCALE_COOKIE}=`))
    ?.split("=")[1];

  return normalizeLocale(cookie);
}

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    setLocale(readLocaleCookie());
  }, []);

  return (
    <main className={styles.page}>
      <section className="container">
        <span>{translate(locale, "error.kicker")}</span>
        <h1>{translate(locale, "error.title")}</h1>
        <p>{translate(locale, "error.body")}</p>
        <div className={styles.actions}>
          <Button icon={<RotateCw aria-hidden="true" size={18} />} onClick={reset}>
            {translate(locale, "error.tryAgain")}
          </Button>
          <LinkButton href="/login" variant="secondary">
            {translate(locale, "notFound.login")}
          </LinkButton>
        </div>
      </section>
    </main>
  );
}
