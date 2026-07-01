import type { Metadata } from "next";
import localFont from "next/font/local";
import { GlobalBackButton } from "@/components/layout/GlobalBackButton";
import { getRequestLocale } from "@/lib/i18n/server";
import "@/styles/globals.css";

const manrope = localFont({
  display: "swap",
  src: "../public/brand-assets/Manrope/Manrope-VariableFont_wght.ttf",
  variable: "--font-manrope",
  weight: "200 900",
});

export const metadata: Metadata = {
  title: {
    default: "AI Edutainment | Schloss Elmau",
    template: "%s | AI Edutainment",
  },
  description: "A private five-day AI course portal for Schloss Elmau students aged 8-18.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();

  return (
    <html className={manrope.variable} lang={locale}>
      <body>
        <GlobalBackButton locale={locale} />
        {children}
      </body>
    </html>
  );
}
