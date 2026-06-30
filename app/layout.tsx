import type { Metadata } from "next";
import { GlobalBackButton } from "@/components/layout/GlobalBackButton";
import { getRequestLocale } from "@/lib/i18n/server";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "AI Edutainment | Schloss Elmau",
    template: "%s | AI Edutainment",
  },
  description: "A private five-day AI course portal for Schloss Elmau students aged 12-18.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();

  return (
    <html lang={locale}>
      <body>
        <GlobalBackButton locale={locale} />
        {children}
      </body>
    </html>
  );
}
