import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Stats } from "@/components/Stats";
import { TrustStrip } from "@/components/TrustStrip";
import { Features } from "@/components/Features";
import { WhyDispatch } from "@/components/WhyDispatch";
import { Architecture } from "@/components/Architecture";
import { CodePreview } from "@/components/CodePreview";
import { Chains } from "@/components/Chains";
import { Seeker } from "@/components/Seeker";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Stats />
      <TrustStrip />
      <Features />
      <WhyDispatch />
      <Architecture />
      <CodePreview />
      <Chains />
      <Seeker />
      <CTA />
      <Footer />
    </main>
  );
}
