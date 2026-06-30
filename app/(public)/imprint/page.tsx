import type { Metadata } from "next";
import { ImprintPageContent } from "@/components/legal/LegalPages";
import { getRequestLocale } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Imprint",
};

export default async function ImprintPage() {
  const locale = await getRequestLocale();
  return <ImprintPageContent locale={locale} />;
}
