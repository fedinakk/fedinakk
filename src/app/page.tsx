import { FormulaSection } from "@/components/home/formula-section";
import { HeroSection } from "@/components/home/hero-section";
import { HowItWorks } from "@/components/home/how-it-works";
import { PreviewCards } from "@/components/home/preview-cards";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PreviewCards />
      <HowItWorks />
      <FormulaSection />
    </>
  );
}
