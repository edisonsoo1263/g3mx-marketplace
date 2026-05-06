import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { TrustBar } from "@/components/sections/TrustBar";
import { TrendingBoosts } from "@/components/sections/TrendingBoosts";
import { LevelShowcase } from "@/components/sections/LevelShowcase";
import { Footer } from "@/components/sections/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustBar />
        <TrendingBoosts />
        <LevelShowcase />
      </main>
      <Footer />
    </>
  );
}
