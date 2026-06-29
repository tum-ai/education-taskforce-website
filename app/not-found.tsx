import { PublicHeader } from "@/components/layout/PublicHeader";
import { LinkButton } from "@/components/ui/Button";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <>
      <PublicHeader />
      <main className={styles.page}>
        <section className="container">
          <span>404</span>
          <h1>Page not found.</h1>
          <p>The page may have moved, or the link may not belong to this course portal.</p>
          <LinkButton href="/login">Go to login</LinkButton>
        </section>
      </main>
    </>
  );
}
