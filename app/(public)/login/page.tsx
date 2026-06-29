import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { getCurrentAccount } from "@/lib/auth/current-account";
import { normalizeUsername } from "@/lib/validation/auth";
import { loginAction } from "./actions";
import styles from "./page.module.css";

type LoginPageProps = {
  searchParams: Promise<{
    u?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
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
      <PublicHeader />
      <main className={styles.page}>
        <section className={`${styles.panel} container`} aria-labelledby="login-title">
          <div className={styles.copy}>
            <span>Private portal</span>
            <h1 id="login-title">Log in to your course space.</h1>
            <p>
              Use the username and password from your course card to see the five day sections and saved
              outcomes.
            </p>
          </div>
          <div className={styles.formPanel}>
            <LoginForm action={loginAction} defaultUsername={defaultUsername} />
          </div>
        </section>
      </main>
    </>
  );
}
