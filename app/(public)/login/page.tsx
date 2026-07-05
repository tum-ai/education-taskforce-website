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
    u?: string | string[];
    next?: string | string[];
  }>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

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
  const usernameParam = firstParam(params.u);
  const defaultUsername = usernameParam ? normalizeUsername(usernameParam) : "";
  // Validated again in loginAction; the loose check just avoids carrying obvious junk.
  const nextParam = firstParam(params.next);
  const nextPath = nextParam?.startsWith("/") ? nextParam : undefined;

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
            <LoginForm action={loginAction} defaultUsername={defaultUsername} locale={locale} nextPath={nextPath} />
          </div>
        </section>
      </main>
    </>
  );
}
