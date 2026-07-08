import { notFound } from "next/navigation";
import { ParticipantPreview } from "@/components/dev/ParticipantPreview";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
  title: "Participant Preview",
};

export default function DevParticipantPreviewPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return <ParticipantPreview />;
}
