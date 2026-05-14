import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/home/HeroSection";
import StatsStrip from "@/components/home/StatsStrip";
import FeatureGrid from "@/components/home/FeatureGrid";
import PricingPreview from "@/components/home/PricingPreview";
import CTASection from "@/components/home/CTASection";
import Footer from "@/components/shared/Footer";

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <StatsStrip />
      <FeatureGrid />
      <PricingPreview />
      <CTASection />
      <Footer />
    </main>
  );
}