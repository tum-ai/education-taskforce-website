import type { Metadata } from "next";
import { DataPrivacyPageContent } from "@/components/legal/LegalPages";
import { getRequestLocale } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Data Privacy",
};

export default async function DataPrivacyPage() {
  const locale = await getRequestLocale();
  return <DataPrivacyPageContent locale={locale} />;
}
