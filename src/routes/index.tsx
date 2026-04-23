import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Hero } from "@/components/landing/Hero";
import { MarketDashboard } from "@/components/landing/MarketDashboard";
import { PlansSection } from "@/components/landing/PlansSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { RoiSection } from "@/components/landing/RoiSection";
import { AboutSection } from "@/components/landing/AboutSection";
import { TeamSection } from "@/components/landing/TeamSection";
import { ContactSection } from "@/components/landing/ContactSection";
import { LiveChartsSection } from "@/components/landing/LiveChartsSection";
import { InvestorsSection } from "@/components/landing/InvestorsSection";
import { LiveInvestmentToasts } from "@/components/LiveInvestmentToasts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gold Empire Investment — Where Wealth Compounds Daily" },
      {
        name: "description",
        content:
          "Institutional-grade investment platform turning gold, crypto and forex into 3% — 20% daily ROI. From $10 to $1M, fully transparent.",
      },
      { property: "og:title", content: "Gold Empire Investment — Where Wealth Compounds Daily" },
      {
        property: "og:description",
        content:
          "Trade gold, crypto and forex with our private desk. 8 plans from Silver to Diamond. Daily ROI, transparent reporting.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <Hero />
        <MarketDashboard />
        <PlansSection />
        <HowItWorks />
        <RoiSection />
        <LiveChartsSection />
        <InvestorsSection />
        <AboutSection />
        <TeamSection />
        <ContactSection />
      </main>
      <SiteFooter />
      <LiveInvestmentToasts />
    </div>
  );
}
