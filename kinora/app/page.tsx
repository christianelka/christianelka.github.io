import HeroContent from "@/components/HeroContent";
import HeroVideoBackground from "@/components/HeroVideoBackground";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <main className="relative min-h-svh w-full overflow-hidden bg-[#397C50] text-white">
      <HeroVideoBackground />
      <Navbar />
      <HeroContent />
    </main>
  );
}
