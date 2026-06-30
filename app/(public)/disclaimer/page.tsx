import type { Metadata } from "next";
import { DisclaimerPageContent } from "@/components/legal/LegalPages";
import { getRequestLocale } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Disclaimer",
};

export default async function DisclaimerPage() {
  const locale = await getRequestLocale();
  return <DisclaimerPageContent locale={locale} />;
}
