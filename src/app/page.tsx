import HeroSection from "../components/sections/HeroSection";
import CatalogSection from "../components/sections/CatalogSection";
import WorkflowSecuritySection from "../components/sections/WorkflowSecuritySection";
import ComparisonSection from "../components/sections/ComparisonSection";
import FooterSection from "../components/sections/FooterSection";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Public Tool Catalog (Real Convex BaaS, Zero PII) */}
      <CatalogSection />

      {/* 3. Workflow Security & HMAC-SHA256 Specifications */}
      <WorkflowSecuritySection />

      {/* 4. Platform Comparison Matrix */}
      <ComparisonSection />

      {/* 5. Minimalist Production Footer */}
      <FooterSection />
    </main>
  );
}
