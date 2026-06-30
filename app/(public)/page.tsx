import { LandingHero } from "@/components/landing/LandingHero";
import { ProgramPreview } from "@/components/landing/ProgramPreview";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { getRequestLocale } from "@/lib/i18n/server";

export default async function LandingPage() {
  const locale = await getRequestLocale();

  return (
    <>
      <PublicHeader locale={locale} />
      <main>
        <LandingHero />
        <ProgramPreview locale={locale} />
      </main>
    </>
  );
}
