import { LandingHero } from "@/components/landing/LandingHero";
import { ProgramPreview } from "@/components/landing/ProgramPreview";
import { PublicHeader } from "@/components/layout/PublicHeader";

export default function LandingPage() {
  return (
    <>
      <PublicHeader />
      <main>
        <LandingHero />
        <ProgramPreview />
      </main>
    </>
  );
}
