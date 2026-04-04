"use client";

import { motion } from "framer-motion";
import { fadeUp, RevealSection } from "./landing-shared";

const FEATURES = [
  {
    icon: "📊",
    title: "Smart Transaction Tracking",
    desc: "Log income and expenses in seconds. 16 Nigerian-specific categories built in.",
  },
  {
    icon: "🏠",
    title: "Family Finance Hub",
    desc: "Shared budgets, family goals, and spending visibility for the whole household.",
  },
  {
    icon: "🏪",
    title: "SME Business Tracker",
    desc: "Separate your personal and business cashflow. Track revenue, costs, and profit.",
  },
  {
    icon: "🤖",
    title: "AI Financial Assistant",
    desc: "Get personalised money advice powered by Claude AI — available 24/7.",
  },
  {
    icon: "📈",
    title: "Investment Portfolio",
    desc: "Track stocks, crypto, and real estate in Naira. Premium feature.",
  },
  {
    icon: "🔔",
    title: "Smart Naira Alerts",
    desc: "Get notified before you overspend. Bill reminders that actually work.",
  },
];

export function LandingFeatures() {
  return (
    <section className="py-24 bg-[#1E3A5F]/80">
      <div className="max-w-6xl mx-auto px-6">
        <RevealSection>
          <motion.div variants={fadeUp} className="text-center mb-16">
            <span className="badge-brand mb-4 inline-block">Features</span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              Everything you need.{" "}
              <span className="text-gradient-brand">Nothing you don&apos;t.</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Purpose-built for the Nigerian financial reality.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className="group relative gradient-border rounded-2xl p-6 cursor-default transition-all duration-300"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-white font-semibold text-base mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: "linear-gradient(135deg, rgba(10,110,94,0.08), rgba(16,185,129,0.04))",
                  }}
                />
              </motion.div>
            ))}
          </div>
        </RevealSection>
      </div>
    </section>
  );
}
