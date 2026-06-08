import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/site/Hero";
import { HowItWorks } from "@/components/site/HowItWorks";
import { LiveMatchDemo } from "@/components/site/LiveMatchDemo";
import { WhyUs } from "@/components/site/WhyUs";
import { Stats } from "@/components/site/Stats";
import { Testimonials } from "@/components/site/Testimonials";
import { CTA } from "@/components/site/CTA";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>RentSaathi — Post once. Get matched. A rental matchmaker.</title>
        <meta name="description" content="RentSaathi is a privacy-first rental matchmaking platform. Post your requirement once and verified brokers bring scored matches to you — no listings to scroll, no spam calls." />
      </Helmet>
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <LiveMatchDemo />
        <WhyUs />
        <Stats />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
