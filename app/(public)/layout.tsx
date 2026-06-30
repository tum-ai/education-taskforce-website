import { Footer } from "@/components/layout/Footer";
import { getRequestLocale } from "@/lib/i18n/server";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();

  return (
    <div className="site-shell">
      <div className="site-content">{children}</div>
      <Footer locale={locale} />
    </div>
  );
}
