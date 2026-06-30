import type { Metadata } from "next";
import { ImprintPageContent } from "@/components/legal/LegalPages";

export const metadata: Metadata = {
  title: "Imprint",
};

export default function ImprintPage() {
  return <ImprintPageContent />;
}
