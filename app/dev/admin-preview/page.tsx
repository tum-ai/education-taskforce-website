import { notFound } from "next/navigation";
import { AdminPreview } from "@/components/dev/AdminPreview";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
  title: "Admin Preview",
};

export default function DevAdminPreviewPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return <AdminPreview />;
}
