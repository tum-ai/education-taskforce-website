"use client";

import { RotateCw } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/Button";
import styles from "./error.module.css";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className={styles.page}>
      <section className="container">
        <span>Error</span>
        <h1>Something interrupted this page.</h1>
        <p>Try loading it again. If it keeps failing, check that Supabase environment variables are configured.</p>
        <div className={styles.actions}>
          <Button icon={<RotateCw aria-hidden="true" size={18} />} onClick={reset}>
            Try again
          </Button>
          <LinkButton href="/login" variant="secondary">
            Go to login
          </LinkButton>
        </div>
      </section>
    </main>
  );
}
