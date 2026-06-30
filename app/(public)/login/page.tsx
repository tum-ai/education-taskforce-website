import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { getCurrentAccount } from "@/lib/auth/current-account";
import { getRequestLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/translations";
import { normalizeUsername } from "@/lib/validation/auth";
import { loginAction } from "./actions";
import styles from "./page.module.css";

type LoginPageProps = {
  searchParams: Promise<{
    u?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const locale = await getRequestLocale();
  const account = await getCurrentAccount();

  if (account?.role === "admin") {
    redirect("/admin");
  }

  if (account?.role === "participant") {
    redirect("/portal");
  }

  const params = await searchParams;
  const defaultUsername = params.u ? normalizeUsername(params.u) : "";

  return (
    <>
      <PublicHeader locale={locale} />
      <main className={styles.page}>
        <section className={`${styles.panel} container`} aria-labelledby="login-title">
          <div className={styles.copy}>
            <span>{translate(locale, "login.kicker")}</span>
            <h1 id="login-title">{translate(locale, "login.title")}</h1>
            <p>{translate(locale, "login.body")}</p>
          </div>
          <div className={styles.formPanel}>
            <LoginForm action={loginAction} defaultUsername={defaultUsername} locale={locale} />
          </div>
        </section>
      </main>
    </>
  );
}
