"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import { fadeUp, RevealSection } from "./landing-shared";

export function LandingAI() {
  return (
    <section
      className="py-24 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0D1B3E 0%, #0A6E5E 60%, #10B981 100%)" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(at 70% 50%, rgba(245,166,35,0.1) 0px, transparent 50%)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <RevealSection>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left text */}
            <div className="flex flex-col gap-6">
              <motion.div variants={fadeUp}>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold">
                  🤖 AI-Powered
                </span>
              </motion.div>
              <motion.h2
                variants={fadeUp}
                className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight"
              >
                Meet your AI Money Coach
              </motion.h2>
              <motion.p variants={fadeUp} className="text-slate-200 text-lg leading-relaxed">
                Ask anything about your finances. Get instant, personalized advice based on your actual
                spending patterns — powered by Claude AI.
              </motion.p>
              <motion.div variants={fadeUp}>
                <AppButton variant="gold" size="lg" onClick={() => (window.location.href = "/register")}>
                  Try the AI Coach Free
                  <ArrowRight className="w-4 h-4" />
                </AppButton>
              </motion.div>
            </div>

            {/* Right: chat mockup */}
            <motion.div variants={fadeUp} className="flex justify-center lg:justify-end">
              <div
                className="w-full max-w-sm rounded-3xl overflow-hidden border border-white/20 shadow-2xl"
                style={{ background: "rgba(13,27,62,0.8)", backdropFilter: "blur(24px)" }}
              >
                <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
                  <motion.div
                    className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-lg shadow-glow-brand"
                    animate={{
                      boxShadow: [
                        "0 0 8px rgba(16,185,129,0.3)",
                        "0 0 24px rgba(16,185,129,0.7)",
                        "0 0 8px rgba(16,185,129,0.3)",
                      ],
                    }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  >
                    🤖
                  </motion.div>
                  <div>
                    <p className="text-white font-semibold text-sm">TrackFlow AI</p>
                    <p className="text-green-400 text-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                      Online
                    </p>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex justify-end">
                    <div className="bg-brand-600/70 rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[80%]">
                      <p className="text-white text-sm">Why am I always broke before month end?</p>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div
                      className="rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]"
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <p className="text-slate-200 text-sm leading-relaxed">
                        Looking at your last 3 months, 34% of your spend happens in the first week. Your
                        biggest leak is{" "}
                        <span className="text-gold-400 font-semibold">food delivery</span> — ₦47,000/month
                        on average. Want me to set a budget cap?
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-brand-600/70 rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[80%]">
                      <p className="text-white text-sm">Yes, set it to ₦20,000</p>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div
                      className="rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]"
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <p className="text-slate-200 text-sm leading-relaxed">
                        ✅ Done! Food delivery budget set to{" "}
                        <span className="text-green-400 font-semibold">₦20,000/month</span>. I&apos;ll
                        alert you at 80%. That&apos;s a potential saving of ₦27,000 this month!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-4 pb-4">
                  <div
                    className="rounded-xl px-4 py-3 flex items-center gap-2"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <span className="text-slate-500 text-sm flex-1">Ask about your finances…</span>
                    <ArrowRight className="w-4 h-4 text-brand-400" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </RevealSection>
      </div>
    </section>
  );
}
