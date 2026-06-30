import { Footer } from "@/components/layout/Footer";

export default function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="site-shell">
      <div className="site-content">{children}</div>
      <Footer />
    </div>
  );
}
