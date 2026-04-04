"use client";

import { motion } from "framer-motion";
import { fadeUp, RevealSection } from "./landing-shared";

const PROBLEMS = [
  { emoji: "💸", text: "Where did my money go this month?" },
  { emoji: "📦", text: "My business income and expenses are scattered everywhere." },
  { emoji: "👨‍👩‍👧", text: "I have no idea if we're spending too much as a family." },
  { emoji: "📱", text: "I keep forgetting my bills and subscriptions." },
];

export function LandingProblem() {
  return (
    <section id="features" className="py-24 bg-[#0D1B3E]">
      <div className="max-w-6xl mx-auto px-6">
        <RevealSection>
          <motion.div variants={fadeUp} className="text-center mb-16">
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              Sound familiar?
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Millions of Nigerians face these exact money problems every month.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4">
            {PROBLEMS.map((p, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="relative overflow-hidden rounded-2xl p-6 flex items-start gap-4"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-red-500/60" />
                <span className="text-3xl shrink-0">{p.emoji}</span>
                <p className="text-slate-200 text-base font-medium leading-snug">{p.text}</p>
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeUp} className="mt-12 text-center">
            <p className="text-brand-400 font-semibold text-lg">
              TrackFlow solves all of this. ✓
            </p>
          </motion.div>
        </RevealSection>
      </div>
    </section>
  );
}
