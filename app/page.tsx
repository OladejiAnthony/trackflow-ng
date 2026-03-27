import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-dark relative overflow-hidden">
      {/* Mesh gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(at 20% 30%, rgba(26,79,245,0.25) 0px, transparent 50%), radial-gradient(at 80% 10%, rgba(91,148,255,0.15) 0px, transparent 50%), radial-gradient(at 60% 80%, rgba(34,197,94,0.08) 0px, transparent 40%)",
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-brand">
              <span className="text-white font-bold font-display text-lg">T</span>
            </div>
            <span className="text-white font-bold font-display text-xl tracking-tight">
              TrackFlow
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-slate-300 hover:text-white text-sm font-medium transition-colors px-4 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="btn-brand text-sm px-5 py-2.5"
            >
              Get Started Free
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse-slow" />
            <span className="text-brand-300 text-xs font-semibold uppercase tracking-wider">
              Built for Nigerians
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display text-white max-w-4xl leading-tight mb-6">
            Take Control of Your{" "}
            <span className="text-gradient-brand">Finances</span>{" "}
            with Clarity
          </h1>

          <p className="text-slate-400 text-lg max-w-2xl leading-relaxed mb-10">
            Track income, expenses, and savings in Naira. Set budgets, achieve
            goals, and get AI-powered insights tailored for individuals,
            families, and Nigerian SMEs.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link href="/register" className="btn-brand px-8 py-3.5 text-base">
              Start Tracking Free
            </Link>
            <Link href="/login" className="btn-outline px-8 py-3.5 text-base border-slate-600 text-slate-300 hover:bg-slate-800">
              Sign In
            </Link>
          </div>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg">
            {[
              { value: "₦0", label: "To start" },
              { value: "AI", label: "Powered insights" },
              { value: "PWA", label: "Works offline" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-white font-display">
                  {stat.value}
                </div>
                <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Feature pills */}
        <section className="pb-20 px-6">
          <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { emoji: "💰", title: "Expense Tracking", desc: "Naira-first" },
              { emoji: "📊", title: "Smart Budgets", desc: "Category limits" },
              { emoji: "🎯", title: "Savings Goals", desc: "Hit milestones" },
              { emoji: "🤖", title: "AI Insights", desc: "Personalised tips" },
            ].map((f) => (
              <div
                key={f.title}
                className="glass rounded-2xl p-5 text-center"
              >
                <div className="text-3xl mb-3">{f.emoji}</div>
                <div className="text-white font-semibold text-sm">{f.title}</div>
                <div className="text-slate-400 text-xs mt-1">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-6 text-slate-600 text-xs border-t border-slate-800/50">
          © {new Date().getFullYear()} TrackFlow · Made with ❤️ for Nigeria
        </footer>
      </div>
    </main>
  );
}
