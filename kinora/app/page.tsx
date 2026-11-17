import AboutSection from "@/components/AboutSection";
import CommunitySection from "@/components/CommunitySection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import HeroContent from "@/components/HeroContent";
import HeroVideoBackground from "@/components/HeroVideoBackground";
import Navbar from "@/components/Navbar";
import SolutionsSection from "@/components/SolutionsSection";

export default function Home() {
  return (
    <main id="top" className="w-full bg-white">
      <Navbar />

      {/* Hero — full-screen, video background */}
      <section
        aria-label="KINORA hero"
        className="relative min-h-svh w-full overflow-hidden bg-[#397C50] text-white"
      >
        <HeroVideoBackground />
        <HeroContent />
      </section>

      <AboutSection />
      <SolutionsSection />
      <CommunitySection />
      <ContactSection />
      <Footer />
    </main>
  );
}
