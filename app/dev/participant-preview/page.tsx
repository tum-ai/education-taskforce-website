import { notFound } from "next/navigation";
import { ParticipantPreview } from "@/components/dev/ParticipantPreview";
import { canRenderLocalPreview } from "@/lib/dev/preview";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
  title: "Participant Preview",
};

export default async function DevParticipantPreviewPage() {
  if (!(await canRenderLocalPreview())) {
    notFound();
  }

  return <ParticipantPreview />;
}
