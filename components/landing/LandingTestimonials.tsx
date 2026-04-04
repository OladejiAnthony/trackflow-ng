"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { fadeUp, RevealSection } from "./landing-shared";

const TESTIMONIALS = [
  {
    initials: "AO",
    color: "bg-brand-600",
    name: "Adaeze Okafor",
    role: "Digital Marketer",
    state: "Lagos",
    stars: 5,
    quote:
      "TrackFlow completely changed how I handle my finances. The AI insights showed me I was spending 40% of my income on subscriptions I forgot about!",
  },
  {
    initials: "KA",
    color: "bg-gold-600",
    name: "Kunle Adeyemi",
    role: "SME Owner",
    state: "Ibadan",
    stars: 5,
    quote:
      "Finally a finance app that understands Nigerian business. Tracking my shop income and expenses in Naira, offline-capable — this is exactly what I needed.",
  },
  {
    initials: "NG",
    color: "bg-purple-600",
    name: "Ngozi & Emeka",
    role: "Family of 4",
    state: "Abuja",
    stars: 5,
    quote:
      "We used to argue about money every month. Now we both see the same family dashboard and it's made us so much more aligned on our goals.",
  },
];

export function LandingTestimonials() {
  return (
    <section className="py-24 bg-[#0D1B3E]">
      <div className="max-w-6xl mx-auto px-6">
        <RevealSection>
          <motion.div variants={fadeUp} className="text-center mb-16">
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              What Nigerians are saying
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <motion.div
                key={t.name}
                variants={fadeUp}
                className="rounded-2xl p-6 flex flex-col gap-4"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(16px)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-slate-500 text-xs">
                      {t.role} · {t.state}
                    </p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-gold-400 text-gold-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
              </motion.div>
            ))}
          </div>
        </RevealSection>
      </div>
    </section>
  );
}
