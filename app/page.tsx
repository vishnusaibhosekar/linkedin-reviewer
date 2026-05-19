import Navbar from "./components/landing/Navbar";
import HeroSection from "./components/landing/HeroSection";
import StatsSection from "./components/landing/StatsSection";
import ServicesSection from "./components/landing/ServicesSection";
import HowItWorksSection from "./components/landing/HowItWorksSection";
import ScoreBreakdownSection from "./components/landing/ScoreBreakdownSection";
import AboutSection from "./components/landing/AboutSection";
import TestimonialsSection from "./components/landing/TestimonialsSection";
import CTASection from "./components/landing/CTASection";
import Footer from "./components/landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <ServicesSection />
      <HowItWorksSection />
      <ScoreBreakdownSection />
      <AboutSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  );
}
