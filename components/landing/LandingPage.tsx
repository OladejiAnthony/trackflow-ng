"use client";

import { LandingNavbar } from "./LandingNavbar";
import { LandingHero } from "./LandingHero";
import { LandingProblem } from "./LandingProblem";
import { LandingFeatures } from "./LandingFeatures";
import { LandingAccountTypes } from "./LandingAccountTypes";
import { LandingPricing } from "./LandingPricing";
import { LandingTestimonials } from "./LandingTestimonials";
import { LandingAI } from "./LandingAI";
import { LandingFooter } from "./LandingFooter";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-navy-DEFAULT text-white overflow-x-hidden">
      <LandingNavbar />
      <LandingHero />
      <LandingProblem />
      <LandingFeatures />
      <LandingAccountTypes />
      <LandingPricing />
      <LandingTestimonials />
      <LandingAI />
      <LandingFooter />
    </div>
  );
}
