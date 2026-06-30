import type { Metadata } from "next";
import { DataPrivacyPageContent } from "@/components/legal/LegalPages";

export const metadata: Metadata = {
  title: "Data Privacy",
};

export default function DataPrivacyPage() {
  return <DataPrivacyPageContent />;
}
