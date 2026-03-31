"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, ChevronLeft, ChevronRight,
  Zap, Shield, TrendingUp, Bell,
} from "lucide-react";
import { AppButton as Button } from "@/components/ui/AppButton";
import { Confetti } from "../_components/Confetti";
import { completeOnboarding } from "../actions";

// ─── Tip cards ────────────────────────────────────────────────────────────────

const TIPS = [
  {
    icon:    Zap,
    color:   "from-gold-500/20 to-amber-500/10",
    iconCls: "text-gold-400",
    title:   "Log in under 10 seconds",
    body:    "Use the quick-add button (+) on your dashboard. Just pick a category, enter the amount, and you're done.",
  },
  {
    icon:    TrendingUp,
    color:   "from-brand-500/20 to-cyan-500/10",
    iconCls: "text-brand-400",
    title:   "Review your AI insights weekly",
    body:    "Every Sunday, TrackFlow analyses your spending and surfaces patterns you might have missed.",
  },
  {
    icon:    Bell,
    color:   "from-purple-500/20 to-pink-500/10",
    iconCls: "text-purple-400",
    title:   "Set budget alerts at 70 %",
    body:    "Catching overspend early is easier than recovering from it. Open Budgets → Edit → set threshold to 70 %.",
  },
  {
    icon:    Shield,
    color:   "from-emerald-500/20 to-teal-500/10",
    iconCls: "text-emerald-400",
    title:   "Your data never leaves Nigeria",
    body:    "All data is stored on Supabase's Lagos region. We never sell or share your financial information.",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DonePage() {
  const router = useRouter();

  const [current, setCurrent]    = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPending, startTransition] = useTransition();

  function goTo(index: number) {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  }
  function prev() { if (current > 0) goTo(current - 1); }
  function next() { if (current < TIPS.length - 1) goTo(current + 1); }

  function handleGoToDashboard() {
    startTransition(async () => {
      await completeOnboarding();
      router.push("/dashboard");
    });
  }

  const { icon: Icon, color, iconCls, title, body } = TIPS[current];

  return (
    <>
      <Confetti count={60} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center"
      >
        {/* Hero */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-8"
        >
          <div className="text-6xl mb-4">🚀</div>
          <h1 className="text-3xl font-bold font-display text-white tracking-tight mb-2">
            You&apos;re all set!
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
            TrackFlow is ready to help you master your finances. Here are a few
            tips to get the most out of it.
          </p>
        </motion.div>

        {/* Swipeable tip card */}
        <div className="relative mb-6 select-none">
          {/* Card area */}
          <div className="overflow-hidden rounded-3xl">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={current}
                custom={direction}
                variants={{
                  enter:   (d: number) => ({ x: d * 80, opacity: 0 }),
                  center:  { x: 0,      opacity: 1 },
                  exit:    (d: number) => ({ x: d * -80, opacity: 0 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease: "easeInOut" }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -50 && current < TIPS.length - 1) next();
                  if (info.offset.x >  50 && current > 0)               prev();
                }}
                className={`glass bg-gradient-to-br ${color} rounded-3xl p-6 border border-white/10 text-left cursor-grab active:cursor-grabbing`}
              >
                <div className={`w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${iconCls}`} />
                </div>
                <h2 className="text-lg font-semibold text-white mb-2">{title}</h2>
                <p className="text-sm text-slate-400 leading-relaxed">{body}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Prev / Next arrows */}
          <button
            type="button"
            onClick={prev}
            disabled={current === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/15 transition disabled:opacity-20 disabled:cursor-not-allowed"
            aria-label="Previous tip"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={next}
            disabled={current === TIPS.length - 1}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/15 transition disabled:opacity-20 disabled:cursor-not-allowed"
            aria-label="Next tip"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mb-8">
          {TIPS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to tip ${i + 1}`}
              className={`transition-all duration-200 rounded-full ${
                i === current
                  ? "w-6 h-2 bg-brand-400"
                  : "w-2 h-2 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>

        {/* CTA */}
        <Button
          variant="brand"
          size="lg"
          fullWidth
          loading={isPending}
          onClick={handleGoToDashboard}
        >
          Go to Dashboard
          <ArrowRight className="w-5 h-5" />
        </Button>

        <p className="text-xs text-slate-600 mt-3">
          You can always update your settings later
        </p>
      </motion.div>
    </>
  );
}
