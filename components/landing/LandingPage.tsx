"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useInView,
  type Variants,
} from "framer-motion";
import {
  Menu,
  X,
  Check,
  Star,
  ArrowRight,
  TrendingUp,
  Play,
} from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";

// ─── Animation variants ───────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};
const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
// ─── Section wrapper with useInView ──────────────────────────────────────────
function RevealSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Particles ────────────────────────────────────────────────────────────────
// Generated client-side only to avoid SSR/hydration mismatch from Math.random()

// ─── Data ─────────────────────────────────────────────────────────────────────
const features = [
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

const accountTypes = [
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
    color: "border-white/10",
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
    color: "border-brand-500",
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
    color: "border-white/10",
  },
];

type PricingTab = "Individual" | "Family" | "Business";

const pricing: Record<PricingTab, { name: string; price: string; features: string[]; highlight: boolean }[]> = {
  Individual: [
    {
      name: "Free",
      price: "₦0",
      highlight: false,
      features: ["60-day full trial", "Basic expense tracking", "3 budget categories", "Mobile PWA", "Email support"],
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
      features: ["60-day full trial", "Up to 2 members", "Basic shared budgets", "Mobile PWA", "Email support"],
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
      features: ["60-day full trial", "Basic P&L tracking", "5 expense categories", "Mobile PWA", "Email support"],
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

const testimonials = [
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
    quote:
      "Finally a finance app that understands Nigerian business. Tracking my shop income and expenses in Naira, offline-capable — this is exactly what I needed.",
    stars: 5,
  },
  {
    initials: "NG",
    color: "bg-purple-600",
    name: "Ngozi & Emeka",
    role: "Family of 4",
    state: "Abuja",
    quote:
      "We used to argue about money every month. Now we both see the same family dashboard and it's made us so much more aligned on our goals.",
    stars: 5,
  },
];

// ─── Main component ───────────────────────────────────────────────────────────
export function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<PricingTab>("Individual");
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-navy-DEFAULT text-white overflow-x-hidden">
      {/* ── NAVBAR ── */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled
          ? "backdrop-blur-md bg-[#0D1B3E]/85 border-b border-white/10 shadow-lg"
          : "bg-transparent"
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <Image
              src="/assets/full_logo_dark.png"
              alt="TrackFlow"
              width={160}
              height={40}
              priority
              className="h-9 w-auto"
              style={{ filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.5))" }}
            />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {["Features", "Pricing", "About"].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="text-slate-300 hover:text-white text-sm font-medium transition-colors duration-150"
              >
                {link}
              </a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-slate-300 hover:text-white text-sm font-semibold px-4 py-2 rounded-xl border border-white/20 hover:border-white/40 transition-all duration-150"
            >
              Login
            </Link>
            <AppButton variant="gold" size="sm" onClick={() => (window.location.href = "/register")}>
              Get Started Free
            </AppButton>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="md:hidden overflow-hidden border-t border-white/10 backdrop-blur-md bg-[#0D1B3E]/95"
            >
              <div className="px-6 py-4 flex flex-col gap-4">
                {["Features", "Pricing", "About"].map((link) => (
                  <a
                    key={link}
                    href={`#${link.toLowerCase()}`}
                    className="text-slate-300 hover:text-white text-sm font-medium py-2 transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link}
                  </a>
                ))}
                <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                  <Link href="/login" className="btn-outline text-center py-2.5 text-sm">
                    Login
                  </Link>
                  <Link href="/register" className="btn-gold text-center py-2.5 text-sm">
                    Get Started Free
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ── HERO ── */}
      <section
        id="hero"
        className="relative min-h-screen flex items-center pt-20 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0D1B3E 0%, #0A6E5E 60%, #10B981 100%)" }}
      >
        {/* Particles */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-white/20 pointer-events-none"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
            animate={{ y: [0, -18, 0], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}

        {/* Radial overlays */}
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
              {/* Badge */}
              <motion.div variants={fadeUp}>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold backdrop-blur-sm">
                  🇳🇬 Built for Nigeria
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                variants={fadeUp}
                className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight"
              >
                Track Your Money.
                <br />
                <span className="text-gradient-gold">Build Your Future.</span>
              </motion.h1>

              {/* Subheading */}
              <motion.p variants={fadeUp} className="text-slate-200 text-lg leading-relaxed max-w-lg">
                The smartest way for Nigerians to manage personal, family, and business finances — all in one place.
              </motion.p>

              {/* CTAs */}
              <motion.div variants={fadeUp} className="flex flex-wrap gap-4 pt-2">
                <AppButton
                  variant="gold"
                  size="lg"
                  onClick={() => (window.location.href = "/register")}
                  className="shadow-glow-gold"
                >
                  Start Free for 60 Days
                  <ArrowRight className="w-4 h-4" />
                </AppButton>
                <button className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-white/30 text-white font-semibold text-base hover:bg-white/10 active:scale-[0.98] transition-all duration-150">
                  <Play className="w-4 h-4 fill-white" />
                  Watch Demo
                </button>
              </motion.div>

              {/* Stat badges */}
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
                      {s.prefix}
                      {s.value}
                      {s.suffix}
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
                {/* Mock dashboard card */}
                <div className="rounded-3xl overflow-hidden border border-white/20 shadow-2xl"
                  style={{ background: "rgba(13,27,62,0.85)", backdropFilter: "blur(24px)" }}>
                  {/* Header bar */}
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
                    {/* Balance card */}
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

                    {/* Stat pills */}
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

                    {/* Mini bar chart */}
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
                              background: i === 4 ? "linear-gradient(to top, #10B981, #6EE7B7)" : "rgba(16,185,129,0.25)",
                            }}
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ delay: 0.5 + i * 0.06, duration: 0.4, ease: "easeOut" }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Transaction list */}
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
                          <span className={`text-xs font-mono font-semibold ${t.amount.startsWith("+") ? "text-green-400" : "text-red-400"}`}>
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

        {/* Scroll indicator */}
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

      {/* ── PROBLEM STATEMENT ── */}
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
              {[
                { emoji: "💸", text: "Where did my money go this month?" },
                { emoji: "📦", text: "My business income and expenses are scattered everywhere." },
                { emoji: "👨‍👩‍👧", text: "I have no idea if we're spending too much as a family." },
                { emoji: "📱", text: "I keep forgetting my bills and subscriptions." },
              ].map((p, i) => (
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

      {/* ── FEATURES ── */}
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
              {features.map((f) => (
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
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ background: "linear-gradient(135deg, rgba(10,110,94,0.08), rgba(16,185,129,0.04))" }} />
                </motion.div>
              ))}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── ACCOUNT TYPES ── */}
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
              {accountTypes.map((a) => (
                <motion.div
                  key={a.type}
                  variants={fadeUp}
                  className={`relative rounded-3xl p-8 flex flex-col gap-5 ${a.popular
                    ? "border-2 border-brand-500 shadow-glow-brand"
                    : "border border-white/10"
                    }`}
                  style={{ background: a.popular ? "rgba(10,110,94,0.12)" : "rgba(255,255,255,0.04)", backdropFilter: "blur(16px)" }}
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
                    className={`text-center py-3 rounded-xl font-semibold text-sm transition-all duration-150 ${a.popular ? "btn-brand" : "border border-white/20 text-white hover:bg-white/10"
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

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24 bg-[#1E3A5F]/80">
        <div className="max-w-6xl mx-auto px-6">
          <RevealSection>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
                Simple, honest pricing
              </h2>
              <p className="text-slate-400 text-lg mb-8">Start free for 60 days. No credit card required.</p>

              {/* Tab switcher */}
              <div className="inline-flex rounded-2xl p-1 gap-1" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                {(["Individual", "Family", "Business"] as PricingTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === tab
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
                {pricing[activeTab].map((tier) => (
                  <div
                    key={tier.name}
                    className={`relative rounded-3xl p-8 flex flex-col gap-6 ${tier.highlight
                      ? "border-2 border-gold-500 shadow-gold"
                      : "border border-white/10"
                      }`}
                    style={{
                      background: tier.highlight ? "rgba(245,166,35,0.06)" : "rgba(255,255,255,0.04)",
                      backdropFilter: "blur(16px)",
                    }}
                  >
                    {tier.highlight && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="px-4 py-1.5 rounded-full text-xs font-bold text-[#0D1B3E]"
                          style={{ background: "linear-gradient(90deg,#F5A623,#FCD34D)" }}>
                          ⭐ Most Popular
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-display text-xl font-bold text-white">{tier.name}</h3>
                      <p className="font-mono text-3xl font-bold text-white mt-2">
                        {tier.price}
                        {tier.price !== "₦0" && <span className="text-slate-400 text-sm font-sans font-normal"></span>}
                      </p>
                      {tier.price === "₦0" && (
                        <p className="text-brand-400 text-xs mt-1">60-day free trial included</p>
                      )}
                    </div>
                    <ul className="space-y-3 flex-1">
                      {tier.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                          <Check className={`w-4 h-4 shrink-0 mt-0.5 ${tier.highlight ? "text-gold-400" : "text-brand-400"}`} />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/register"
                      className={`text-center py-3 rounded-xl font-semibold text-sm transition-all duration-150 active:scale-[0.98] ${tier.highlight
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

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 bg-[#0D1B3E]">
        <div className="max-w-6xl mx-auto px-6">
          <RevealSection>
            <motion.div variants={fadeUp} className="text-center mb-16">
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
                What Nigerians are saying
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
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
                    <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{t.name}</p>
                      <p className="text-slate-500 text-xs">{t.role} · {t.state}</p>
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

      {/* ── AI FEATURE HIGHLIGHT ── */}
      <section className="py-24 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0D1B3E 0%, #0A6E5E 60%, #10B981 100%)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(at 70% 50%, rgba(245,166,35,0.1) 0px, transparent 50%)" }} />

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
                <motion.h2 variants={fadeUp} className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight">
                  Meet your AI Money Coach
                </motion.h2>
                <motion.p variants={fadeUp} className="text-slate-200 text-lg leading-relaxed">
                  Ask anything about your finances. Get instant, personalized advice based on your actual spending patterns — powered by Claude AI.
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
                <div className="w-full max-w-sm rounded-3xl overflow-hidden border border-white/20 shadow-2xl"
                  style={{ background: "rgba(13,27,62,0.8)", backdropFilter: "blur(24px)" }}>
                  {/* Chat header */}
                  <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
                    <motion.div
                      className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-lg shadow-glow-brand"
                      animate={{ boxShadow: ["0 0 8px rgba(16,185,129,0.3)", "0 0 24px rgba(16,185,129,0.7)", "0 0 8px rgba(16,185,129,0.3)"] }}
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

                  {/* Messages */}
                  <div className="p-4 space-y-3">
                    <div className="flex justify-end">
                      <div className="bg-brand-600/70 rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[80%]">
                        <p className="text-white text-sm">Why am I always broke before month end?</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]"
                        style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
                        <p className="text-slate-200 text-sm leading-relaxed">
                          Looking at your last 3 months, 34% of your spend happens in the first week. Your biggest leak is <span className="text-gold-400 font-semibold">food delivery</span> — ₦47,000/month on average. Want me to set a budget cap?
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-brand-600/70 rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[80%]">
                        <p className="text-white text-sm">Yes, set it to ₦20,000</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]"
                        style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
                        <p className="text-slate-200 text-sm leading-relaxed">
                          ✅ Done! Food delivery budget set to <span className="text-green-400 font-semibold">₦20,000/month</span>. I&apos;ll alert you at 80%. That&apos;s a potential saving of ₦27,000 this month!
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Input bar */}
                  <div className="px-4 pb-4">
                    <div className="rounded-xl px-4 py-3 flex items-center gap-2"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
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

      {/* ── FOOTER ── */}
      <footer className="bg-[#0D1B3E] border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-16">
          {/* Top row */}
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <Image
                src="/assets/full_logo_dark.png"
                alt="TrackFlow"
                width={140}
                height={36}
                className="h-8 w-auto mb-4"
                style={{ filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.5))" }}
              />
              <p className="text-slate-400 text-sm leading-relaxed">
                Smart finance management built for Nigerian individuals, families, and businesses.
              </p>
              <div className="flex items-center gap-3 mt-5">
                {[
                  {
                    label: "X",
                    href: "#",
                    svg: (
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.845L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
                      </svg>
                    ),
                  },
                  {
                    label: "LinkedIn",
                    href: "#",
                    svg: (
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    ),
                  },
                  {
                    label: "Instagram",
                    href: "#",
                    svg: (
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                      </svg>
                    ),
                  },
                ].map(({ label, href, svg }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/10 text-slate-400 hover:text-white hover:border-white/30 transition-all duration-150"
                  >
                    {svg}
                  </a>
                ))}
              </div>
            </div>

            {/* Link groups */}
            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "AI Coach", "PWA App"],
              },
              {
                title: "Company",
                links: ["About", "Blog", "Careers", "Contact"],
              },
              {
                title: "Legal",
                links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Support"],
              },
            ].map((group) => (
              <div key={group.title}>
                <h4 className="text-white font-semibold text-sm mb-4">{group.title}</h4>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors duration-150">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom row */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">
              © 2025 TrackFlow. All rights reserved.
            </p>
            <p className="text-slate-500 text-sm">
              Made with ❤️ for Nigeria 🇳🇬
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
