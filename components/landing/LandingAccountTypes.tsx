"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { fadeUp, RevealSection } from "./landing-shared";

const ACCOUNT_TYPES = [
  {
    icon: "👤",
    type: "Individual",
    tagline: "For personal finance",
    forWho: "Salary earners, freelancers, students",
    features: [
      "Expense & income tracking",
      "Personal budgets",
      "Savings goals",
      "AI insights",
      "PWA offline access",
    ],
    popular: false,
  },
  {
    icon: "👨‍👩‍👧",
    type: "Family",
    tagline: "For household finances",
    forWho: "Couples, parents, extended families",
    features: [
      "Everything in Individual",
      "Shared family budgets",
      "Multiple member profiles",
      "Family savings goals",
      "Household expense split",
    ],
    popular: true,
  },
  {
    icon: "🏢",
    type: "Business",
    tagline: "For Nigerian SMEs",
    forWho: "Small businesses, traders, startups",
    features: [
      "Everything in Individual",
      "Business income tracking",
      "Profit & loss overview",
      "Invoice tracking",
      "Tax-ready reports",
    ],
    popular: false,
  },
];

export function LandingAccountTypes() {
  return (
    <section className="py-24 bg-[#0D1B3E]">
      <div className="max-w-6xl mx-auto px-6">
        <RevealSection>
          <motion.div variants={fadeUp} className="text-center mb-16">
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              Built for every Nigerian
            </h2>
            <p className="text-slate-400 text-lg">Choose the plan that fits your life.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {ACCOUNT_TYPES.map((a) => (
              <motion.div
                key={a.type}
                variants={fadeUp}
                className={`relative rounded-3xl p-8 flex flex-col gap-5 ${
                  a.popular
                    ? "border-2 border-brand-500 shadow-glow-brand"
                    : "border border-white/10"
                }`}
                style={{
                  background: a.popular ? "rgba(10,110,94,0.12)" : "rgba(255,255,255,0.04)",
                  backdropFilter: "blur(16px)",
                }}
              >
                {a.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="badge-brand px-4 py-1.5 text-xs font-bold">⭐ Most Popular</span>
                  </div>
                )}
                <div>
                  <span className="text-4xl">{a.icon}</span>
                  <h3 className="font-display text-2xl font-bold text-white mt-3">{a.type}</h3>
                  <p className="text-brand-400 text-sm font-medium mt-0.5">{a.tagline}</p>
                  <p className="text-slate-500 text-xs mt-1">For: {a.forWho}</p>
                </div>
                <ul className="space-y-2.5 flex-1">
                  {a.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`text-center py-3 rounded-xl font-semibold text-sm transition-all duration-150 ${
                    a.popular
                      ? "btn-brand"
                      : "border border-white/20 text-white hover:bg-white/10"
                  }`}
                >
                  Get Started
                </Link>
              </motion.div>
            ))}
          </div>
        </RevealSection>
      </div>
    </section>
  );
}
