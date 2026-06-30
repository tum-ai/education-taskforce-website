import type { Metadata } from "next";
import { DisclaimerPageContent } from "@/components/legal/LegalPages";

export const metadata: Metadata = {
  title: "Disclaimer",
};

export default function DisclaimerPage() {
  return <DisclaimerPageContent />;
}
