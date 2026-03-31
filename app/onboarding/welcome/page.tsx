"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Shield, Zap, Bell } from "lucide-react";
import { AppButton as Button } from "@/components/ui/AppButton";
import { Confetti } from "../_components/Confetti";
import { createClient } from "@/lib/supabase/client";

const PREVIEWS = [
  { icon: TrendingUp, title: "AI Spending Insights",   desc: "Get weekly breakdowns of where your money goes" },
  { icon: Shield,     title: "Bank-Grade Security",    desc: "Your data is encrypted and never shared" },
  { icon: Bell,       title: "Smart Reminders",        desc: "Daily summaries and budget alerts" },
  { icon: Zap,        title: "Instant Transaction Log", desc: "Log in seconds from bank SMS alerts" },
];

export default function WelcomePage() {
  const router  = useRouter();
  const [firstName, setFirstName] = useState("there");
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Fetch first name from auth session
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      const name = user?.user_metadata?.full_name ?? user?.email ?? "";
      const first = name.split(" ")[0].split("@")[0];
      if (first) setFirstName(first);
    });
    // Delay confetti slightly for drama
    const t = setTimeout(() => setShowConfetti(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {showConfetti && <Confetti />}

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg text-center"
      >
        {/* Headline */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5, type: "spring" }}
          className="mb-8"
        >
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-white tracking-tight mb-3">
            Welcome to TrackFlow,{" "}
            <span className="text-gradient-brand capitalize">{firstName}!</span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-sm mx-auto">
            You&apos;re about to take full control of your finances. Here&apos;s
            what you can do with TrackFlow:
          </p>
        </motion.div>

        {/* Feature preview cards */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {PREVIEWS.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.1, duration: 0.4 }}
              className="glass rounded-2xl p-4 text-left border border-white/10"
            >
              <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center mb-2">
                <Icon className="w-4 h-4 text-brand-400" />
              </div>
              <p className="text-sm font-semibold text-white mb-1">{title}</p>
              <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Button
            variant="brand"
            size="lg"
            fullWidth
            onClick={() => router.push("/onboarding/setup-profile")}
          >
            Let&apos;s set you up
            <ArrowRight className="w-5 h-5" />
          </Button>
          <p className="text-xs text-slate-600 mt-3">Takes less than 2 minutes</p>
        </motion.div>
      </motion.div>
    </>
  );
}
