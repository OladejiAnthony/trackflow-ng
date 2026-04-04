"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { fadeUp, RevealSection } from "./landing-shared";

type PricingTab = "Individual" | "Family" | "Business";

const PRICING: Record<
  PricingTab,
  { name: string; price: string; features: string[]; highlight: boolean }[]
> = {
  Individual: [
    {
      name: "Free",
      price: "₦0",
      highlight: false,
      features: ["40-day full trial", "Basic expense tracking", "3 budget categories", "Mobile PWA", "Email support"],
    },
    {
      name: "Pro",
      price: "₦1,500/mo",
      highlight: true,
      features: ["Everything in Free", "Unlimited categories", "AI financial insights", "Savings goals", "Priority support"],
    },
    {
      name: "Premium",
      price: "₦3,000/mo",
      highlight: false,
      features: ["Everything in Pro", "Investment tracker", "Advanced reports", "Data export (CSV/PDF)", "Dedicated advisor"],
    },
  ],
  Family: [
    {
      name: "Free",
      price: "₦0",
      highlight: false,
      features: ["40-day full trial", "Up to 2 members", "Basic shared budgets", "Mobile PWA", "Email support"],
    },
    {
      name: "Pro",
      price: "₦3,000/mo",
      highlight: true,
      features: ["Everything in Free", "Up to 6 members", "Family savings goals", "AI insights per member", "Priority support"],
    },
    {
      name: "Premium",
      price: "₦5,000/mo",
      highlight: false,
      features: ["Everything in Pro", "Unlimited members", "Investment tracker", "Full analytics", "Dedicated advisor"],
    },
  ],
  Business: [
    {
      name: "Free",
      price: "₦0",
      highlight: false,
      features: ["40-day full trial", "Basic P&L tracking", "5 expense categories", "Mobile PWA", "Email support"],
    },
    {
      name: "Pro",
      price: "₦2,000/mo",
      highlight: true,
      features: ["Everything in Free", "Unlimited categories", "Invoice tracking", "AI business insights", "Priority support"],
    },
    {
      name: "Premium",
      price: "₦5,000/mo",
      highlight: false,
      features: ["Everything in Pro", "Tax-ready reports", "Multi-account tracking", "Full data export", "Dedicated advisor"],
    },
  ],
};

export function LandingPricing() {
  const [activeTab, setActiveTab] = useState<PricingTab>("Individual");

  return (
    <section id="pricing" className="py-24 bg-[#1E3A5F]/80">
      <div className="max-w-6xl mx-auto px-6">
        <RevealSection>
          <motion.div variants={fadeUp} className="text-center mb-12">
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              Simple, honest pricing
            </h2>
            <p className="text-slate-400 text-lg mb-8">Start free for 40 days. No credit card required.</p>

            <div
              className="inline-flex rounded-2xl p-1 gap-1"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              {(["Individual", "Family", "Business"] as PricingTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === tab
                      ? "bg-brand-600 text-white shadow-brand"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="grid md:grid-cols-3 gap-6"
            >
              {PRICING[activeTab].map((tier) => (
                <div
                  key={tier.name}
                  className={`relative rounded-3xl p-8 flex flex-col gap-6 ${
                    tier.highlight ? "border-2 border-gold-500 shadow-gold" : "border border-white/10"
                  }`}
                  style={{
                    background: tier.highlight ? "rgba(245,166,35,0.06)" : "rgba(255,255,255,0.04)",
                    backdropFilter: "blur(16px)",
                  }}
                >
                  {tier.highlight && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span
                        className="px-4 py-1.5 rounded-full text-xs font-bold text-[#0D1B3E]"
                        style={{ background: "linear-gradient(90deg,#F5A623,#FCD34D)" }}
                      >
                        ⭐ Most Popular
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-display text-xl font-bold text-white">{tier.name}</h3>
                    <p className="font-mono text-3xl font-bold text-white mt-2">
                      {tier.price}
                      {tier.price !== "₦0" && (
                        <span className="text-slate-400 text-sm font-sans font-normal" />
                      )}
                    </p>
                    {tier.price === "₦0" && (
                      <p className="text-brand-400 text-xs mt-1">40-day free trial included</p>
                    )}
                  </div>
                  <ul className="space-y-3 flex-1">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                        <Check
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            tier.highlight ? "text-gold-400" : "text-brand-400"
                          }`}
                        />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/register"
                    className={`text-center py-3 rounded-xl font-semibold text-sm transition-all duration-150 active:scale-[0.98] ${
                      tier.highlight
                        ? "btn-gold"
                        : "border border-white/20 text-white hover:bg-white/10"
                    }`}
                  >
                    {tier.price === "₦0" ? "Start Free Trial" : "Get Started"}
                  </Link>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </RevealSection>
      </div>
    </section>
  );
}
