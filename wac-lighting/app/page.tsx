import type { Metadata } from "next";
import { Cursor } from "@/components/UI/Cursor";
import { SmoothScroll } from "@/components/UI/SmoothScroll";
import { Navbar } from "@/components/Navigation/Navbar";
import { HeroSection } from "@/components/Hero/HeroSection";
import { MarqueeBanner } from "@/components/UI/MarqueeBanner";
import { ProductShowcase } from "@/components/Products/ProductShowcase";
import { CollectionGrid } from "@/components/Collections/CollectionGrid";
import { TechSection } from "@/components/Technology/TechSection";
import { ProjectGallery } from "@/components/Projects/ProjectGallery";
import { StatsSection } from "@/components/Stats/StatsSection";
import { AboutSection } from "@/components/About/AboutSection";
import { ContactSection } from "@/components/Contact/ContactSection";
import { Footer } from "@/components/Footer/Footer";

export const metadata: Metadata = {
  title: "WAC Lighting | Architectural LED Lighting Solutions",
  description:
    "Pioneer of architectural LED illumination. TrueColor™ Technology, SmartLink™ integration, and 40+ years of precision engineering. 50,000+ products for interior, exterior, and commercial applications.",
  openGraph: {
    title: "WAC Lighting | Architectural LED Lighting Solutions",
    description: "Where precision meets beauty. The world's most advanced architectural lighting.",
    url: "https://waclighting.com",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
};

export default function HomePage() {
  return (
    <>
      <Cursor />
      <SmoothScroll>
        <Navbar />
        <main>
          <HeroSection />
          <MarqueeBanner />
          <ProductShowcase />
          <CollectionGrid />
          <TechSection />
          <ProjectGallery />
          <StatsSection />
          <AboutSection />
          <ContactSection />
        </main>
        <Footer />
      </SmoothScroll>
    </>
  );
}
