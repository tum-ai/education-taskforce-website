import { notFound } from "next/navigation";
import { AdminPreview } from "@/components/dev/AdminPreview";
import { canRenderLocalPreview } from "@/lib/dev/preview";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
  title: "Admin Preview",
};

export default async function DevAdminPreviewPage() {
  if (!(await canRenderLocalPreview())) {
    notFound();
  }

  return <AdminPreview />;
}
