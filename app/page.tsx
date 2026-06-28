import { CTASection } from "@/components/home/CTASection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { HeroSection } from "@/components/home/HeroSection";
import { HomeFooter } from "@/components/home/HomeFooter";
import { HomeNavbar } from "@/components/home/HomeNavbar";

export default function Home() {
  return (
    <div className="relative min-h-dvh bg-bg">
      <div className="pointer-events-none fixed inset-0 hero-grid opacity-90" aria-hidden />
      <div className="pointer-events-none fixed inset-0 hero-spotlight opacity-60" aria-hidden />

      <HomeNavbar />

      <main className="relative">
        <HeroSection />
        <FeaturesSection />
        <CTASection />
      </main>

      <HomeFooter />
    </div>
  );
}
