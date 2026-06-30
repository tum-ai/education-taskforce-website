import type { Metadata } from "next";
import { GlobalBackButton } from "@/components/layout/GlobalBackButton";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "AI Edutainment | Schloss Elmau",
    template: "%s | AI Edutainment",
  },
  description: "A private five-day AI course portal for Schloss Elmau students aged 12-18.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <GlobalBackButton />
        {children}
      </body>
    </html>
  );
}
