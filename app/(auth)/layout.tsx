import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, TrendingUp, Shield, Zap } from "lucide-react";

// ─── Static data for the brand panel ─────────────────────────────────────────

const FEATURES = [
  { icon: TrendingUp, text: "AI-powered insights on your spending habits" },
  { icon: Shield,     text: "Bank-grade security for your financial data" },
  { icon: Zap,        text: "Family & business finance in one place" },
];

const TRANSACTIONS = [
  { emoji: "🛒", label: "Shoprite",      amount: "−₦15,200",   positive: false },
  { emoji: "💼", label: "Salary Credit", amount: "+₦580,000",  positive: true  },
  { emoji: "⚡", label: "EKEDC Bill",    amount: "−₦8,400",    positive: false },
];

// ─── Left brand panel (server component, CSS-animated) ───────────────────────

function BrandPanel() {
  return (
    <div
      className="hidden lg:flex lg:w-[52%] flex-col relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0D1B3E 0%, #0A6E5E 60%, #10B981 100%)" }}
    >
      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute w-96 h-96 rounded-full opacity-20 animate-pulse-slow"
          style={{
            background: "radial-gradient(circle, #10B981, transparent)",
            top: "-4rem",
            right: "-4rem",
          }}
        />
        <div
          className="absolute w-64 h-64 rounded-full opacity-10 animate-pulse-slow"
          style={{
            background: "radial-gradient(circle, #F5A623, transparent)",
            bottom: "8rem",
            left: "-3rem",
            animationDelay: "1.5s",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col h-full px-12 py-10">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-3 mb-auto">
          <Image
            src="/assets/full_logo_dark.png"
            alt="TrackFlow"
            width={140}
            height={36}
            priority
          />
        </Link>

        {/* Main copy */}
        <div className="my-auto">
          <h1 className="text-4xl xl:text-5xl font-bold font-display text-white leading-tight tracking-tight mb-4">
            Smart Finance<br />
            <span className="text-brand-300">for Modern Nigerians</span>
          </h1>
          <p className="text-white/70 text-lg mb-8 leading-relaxed">
            Track every naira, hit every goal.
          </p>

          {/* Feature list */}
          <ul className="space-y-3 mb-10">
            {FEATURES.map(({ text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-brand-400" />
                </div>
                <span className="text-white/80 text-sm">{text}</span>
              </li>
            ))}
          </ul>

          {/* Floating dashboard mockup */}
          <div className="animate-float max-w-sm">
            <DashboardMockup />
          </div>
        </div>

        {/* Social proof footer */}
        <p className="text-white/40 text-xs mt-auto pt-6">
          Trusted by 10,000+ Nigerians managing their finances smarter.
        </p>
      </div>
    </div>
  );
}

// ─── Dashboard mockup (decorative) ───────────────────────────────────────────

function DashboardMockup() {
  return (
    <div className="rounded-2xl overflow-hidden shadow-card-xl" style={{ background: "rgba(13,27,62,0.7)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.12)" }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-white/10">
        <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Total Balance</p>
        <p className="text-2xl font-bold text-white font-mono tracking-tight">₦2,450,000</p>
        <div className="flex items-center gap-5 mt-3">
          <div>
            <p className="text-[10px] text-brand-400 font-medium uppercase tracking-wide">↑ Income</p>
            <p className="text-sm font-semibold text-white">₦580,000</p>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <div>
            <p className="text-[10px] text-red-400 font-medium uppercase tracking-wide">↓ Expenses</p>
            <p className="text-sm font-semibold text-white">₦245,000</p>
          </div>
          <div className="ml-auto">
            <div className="flex gap-0.5 items-end h-8">
              {[40, 65, 45, 80, 55, 70, 90].map((h, i) => (
                <div
                  key={i}
                  className="w-2 rounded-sm"
                  style={{
                    height: `${h}%`,
                    background: i === 6 ? "#10B981" : "rgba(255,255,255,0.15)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="px-5 py-3">
        <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Recent</p>
        <div className="space-y-2.5">
          {TRANSACTIONS.map((tx) => (
            <div key={tx.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-sm">
                  {tx.emoji}
                </div>
                <span className="text-xs text-white/80">{tx.label}</span>
              </div>
              <span
                className="text-xs font-semibold tabular-nums"
                style={{ color: tx.positive ? "#34d399" : "#f87171" }}
              >
                {tx.amount}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Budget progress */}
      <div className="px-5 pb-5 pt-2 border-t border-white/10 mt-1">
        <div className="flex justify-between items-center mb-1.5">
          <p className="text-xs text-white/60">Food Budget</p>
          <p className="text-xs text-brand-400 font-medium">65%</p>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full rounded-full w-[65%]" style={{ background: "linear-gradient(90deg, #0A6E5E, #10B981)" }} />
        </div>
      </div>
    </div>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left: brand panel */}
      <BrandPanel />

      {/* Right: form panel */}
      <div
        className="w-full lg:w-[48%] min-h-screen flex flex-col overflow-y-auto auth-panel"
        style={{ background: "linear-gradient(160deg, #0D1B3E 0%, #0f2347 50%, #0D1B3E 100%)" }}
      >
        {/* Mobile-only logo */}
        <div className="lg:hidden flex justify-center pt-10 pb-2">
          <Link href="/">
            <Image
              src="/assets/icon_mark_dark.png"
              alt="TrackFlow"
              width={44}
              height={44}
              priority
            />
          </Link>
        </div>

        {/* Form content */}
        <div className="flex-1 flex items-center justify-center px-6 py-10">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-700 pb-6 px-4">
          © {new Date().getFullYear()} TrackFlow · All rights reserved
        </p>
      </div>
    </div>
  );
}
