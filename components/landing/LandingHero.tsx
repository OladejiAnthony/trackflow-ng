"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Play } from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import { fadeUp, stagger } from "./landing-shared";

export function LandingHero() {
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number; size: number; delay: number; duration: number }[]
  >([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        delay: Math.random() * 5,
        duration: Math.random() * 4 + 4,
      }))
    );
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center pt-20 overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0D1B3E 0%, #0A6E5E 60%, #10B981 100%)" }}
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/20 pointer-events-none"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -18, 0], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(at 20% 50%, rgba(16,185,129,0.15) 0px, transparent 55%), radial-gradient(at 80% 20%, rgba(245,166,35,0.08) 0px, transparent 45%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: text */}
          <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-6">
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold backdrop-blur-sm">
                🇳🇬 Built for Nigeria
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight"
            >
              Track Your Money.
              <br />
              <span className="text-gradient-gold">Build Your Future.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-slate-200 text-lg leading-relaxed max-w-lg">
              The smartest way for Nigerians to manage personal, family, and business finances — all in one place.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-4 pt-2">
              <AppButton
                variant="gold"
                size="lg"
                onClick={() => (window.location.href = "/register")}
                className="shadow-glow-gold"
              >
                Start Free for 40 Days
                <ArrowRight className="w-4 h-4" />
              </AppButton>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-white/30 text-white font-semibold text-base hover:bg-white/10 active:scale-[0.98] transition-all duration-150"
              >
                <Play className="w-4 h-4 fill-white" />
                Watch Demo
              </a>
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-3 pt-2">
              {[
                { value: "2.4M", prefix: "₦", suffix: " Saved", label: "by our users" },
                { value: "12000", prefix: "", suffix: "+", label: "Users" },
                { value: "98", prefix: "", suffix: "%", label: "Satisfaction" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-brand-300" />
                  <span className="text-white text-sm font-bold font-mono">
                    {s.prefix}{s.value}{s.suffix}
                  </span>
                  <span className="text-slate-300 text-xs">{s.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="hidden lg:flex justify-center"
            style={{ perspective: 1000 }}
          >
            <motion.div
              whileHover={{ rotateY: -6, rotateX: 3, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="w-full max-w-md"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div
                className="rounded-3xl overflow-hidden border border-white/20 shadow-2xl"
                style={{ background: "rgba(13,27,62,0.85)", backdropFilter: "blur(24px)" }}
              >
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  </div>
                  <span className="text-slate-400 text-xs font-mono">TrackFlow Dashboard</span>
                  <div className="w-6 h-6 rounded-full bg-brand-500/30 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-brand-400" />
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div
                    className="rounded-2xl p-4"
                    style={{ background: "linear-gradient(135deg, #0A6E5E, #10B981)" }}
                  >
                    <p className="text-brand-100 text-xs font-medium mb-1">Total Balance</p>
                    <p className="text-white text-3xl font-bold font-mono">₦847,200</p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="w-3 h-3 text-brand-200" />
                      <span className="text-brand-200 text-xs">+12.4% this month</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Income", value: "₦320,000", color: "text-green-400" },
                      { label: "Expenses", value: "₦187,400", color: "text-red-400" },
                    ].map((s) => (
                      <div key={s.label} className="rounded-xl p-3 bg-white/5 border border-white/10">
                        <p className="text-slate-400 text-xs">{s.label}</p>
                        <p className={`font-bold font-mono text-sm mt-0.5 ${s.color}`}>{s.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl p-4 bg-white/5 border border-white/10">
                    <p className="text-slate-400 text-xs mb-3">Weekly Spending</p>
                    <div className="flex items-end gap-2 h-14">
                      {[40, 65, 45, 80, 55, 70, 35].map((h, i) => (
                        <motion.div
                          key={i}
                          className="flex-1 rounded-t-sm"
                          style={{
                            transformOrigin: "bottom",
                            height: `${h}%`,
                            background:
                              i === 4
                                ? "linear-gradient(to top, #10B981, #6EE7B7)"
                                : "rgba(16,185,129,0.25)",
                          }}
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{ delay: 0.5 + i * 0.06, duration: 0.4, ease: "easeOut" }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {[
                      { name: "Shoprite", amount: "-₦12,400", icon: "🛒" },
                      { name: "Salary", amount: "+₦320,000", icon: "💼" },
                      { name: "MTN Airtime", amount: "-₦2,000", icon: "📱" },
                    ].map((t) => (
                      <div key={t.name} className="flex items-center justify-between py-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{t.icon}</span>
                          <span className="text-slate-300 text-xs">{t.name}</span>
                        </div>
                        <span
                          className={`text-xs font-mono font-semibold ${
                            t.amount.startsWith("+") ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {t.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center pt-2">
          <div className="w-1 h-2 rounded-full bg-white/60" />
        </div>
      </motion.div>
    </section>
  );
}
