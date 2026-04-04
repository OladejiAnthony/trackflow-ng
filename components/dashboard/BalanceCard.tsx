"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Wallet, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatNaira, cn } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/useAuth";

// ─── Count-up hook ────────────────────────────────────────────────────────────
function useCountUp(end: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (end === 0) { setValue(0); return; }
    let startTime: number | null = null;
    let raf: number;
    function animate(t: number) {
      if (!startTime) startTime = t;
      const progress = Math.min((t - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * end));
      if (progress < 1) raf = requestAnimationFrame(animate);
    }
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [end, duration]);
  return value;
}

// ─── Data fetching ────────────────────────────────────────────────────────────
function pctChange(current: number, prev: number) {
  if (prev === 0) return current > 0 ? 100 : 0;
  return ((current - prev) / Math.abs(prev)) * 100;
}

type BalanceStats = {
  balance: number;
  income: number;
  expenses: number;
  balanceChange: number;
  incomeChange: number;
  expenseChange: number;
};

export default function BalanceCard({ initialData }: { initialData?: BalanceStats }) {
  const { user }            = useAuth();
  const [hidden, setHidden] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey:            ["balance-overview", user?.id],
    enabled:             !!user?.id,
    staleTime:           60_000,
    refetchInterval:     30_000,
    initialData:         initialData,
    initialDataUpdatedAt: initialData ? Date.now() : undefined,
    queryFn: async () => {
      const supabase = createClient();
      const now        = new Date();
      const thisStart  = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
      const thisEnd    = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
      const lastStart  = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split("T")[0];

      const { data: rows } = await supabase
        .from("transactions")
        .select("type, amount, date")
        .eq("user_id", user!.id)
        .gte("date", lastStart)
        .lte("date", thisEnd);

      const all = rows ?? [];

      const thisMonth   = all.filter(t => t.date >= thisStart);
      const lastMonth   = all.filter(t => t.date < thisStart);

      const thisIncome  = thisMonth.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const thisExpense = thisMonth.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
      const lastIncome  = lastMonth.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const lastExpense = lastMonth.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);

      return {
        balance:       thisIncome - thisExpense,
        income:        thisIncome,
        expenses:      thisExpense,
        balanceChange: pctChange(thisIncome - thisExpense, lastIncome - lastExpense),
        incomeChange:  pctChange(thisIncome, lastIncome),
        expenseChange: pctChange(thisExpense, lastExpense),
      };
    },
  });

  const balanceVal  = useCountUp(data?.balance  ?? 0);
  const incomeVal   = useCountUp(data?.income   ?? 0);
  const expenseVal  = useCountUp(data?.expenses ?? 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Total Balance */}
      <BalanceStatCard
        label="Total Balance"
        value={balanceVal}
        change={data?.balanceChange}
        gradient="bg-gradient-brand"
        icon={<Wallet className="w-5 h-5 text-white/80" />}
        isLoading={isLoading}
        hidden={hidden}
        onToggleHidden={() => setHidden(h => !h)}
        showToggle
      />
      {/* Income */}
      <BalanceStatCard
        label="Income This Month"
        value={incomeVal}
        change={data?.incomeChange}
        gradient="bg-gradient-success"
        icon={<TrendingUp className="w-5 h-5 text-white/80" />}
        isLoading={isLoading}
        hidden={hidden}
        positive
      />
      {/* Expenses */}
      <BalanceStatCard
        label="Expenses This Month"
        value={expenseVal}
        change={data?.expenseChange}
        gradient="bg-gradient-danger"
        icon={<TrendingDown className="w-5 h-5 text-white/80" />}
        isLoading={isLoading}
        hidden={hidden}
        invertChange
      />
    </div>
  );
}

// ─── Individual stat card ─────────────────────────────────────────────────────
function BalanceStatCard({
  label, value, change, gradient, icon, isLoading, hidden,
  showToggle, onToggleHidden, positive, invertChange,
}: {
  label: string;
  value: number;
  change?: number;
  gradient: string;
  icon: React.ReactNode;
  isLoading: boolean;
  hidden: boolean;
  showToggle?: boolean;
  onToggleHidden?: () => void;
  positive?: boolean;
  invertChange?: boolean;
}) {
  const displayChange = invertChange ? -(change ?? 0) : (change ?? 0);
  const isPositive    = displayChange >= 0;

  return (
    <div className={cn("rounded-2xl p-5 text-white shadow-card-lg relative overflow-hidden animate-slide-up", gradient)}>
      {/* Ambient orb */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">{icon}</div>
            <p className="text-xs text-white/75 font-medium">{label}</p>
          </div>
          {showToggle && (
            <button onClick={onToggleHidden} className="opacity-60 hover:opacity-100 transition-opacity" aria-label="Toggle visibility">
              {hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="h-8 w-36 rounded-lg skeleton mb-2" />
        ) : (
          <p className="text-2xl lg:text-3xl font-bold font-mono tracking-tight mb-2">
            {hidden ? "₦ ••••" : formatNaira(value, { compact: true })}
          </p>
        )}

        {!isLoading && change !== undefined && (
          <div className={cn("flex items-center gap-1 text-xs font-semibold", isPositive ? "text-white/90" : "text-white/60")}>
            {isPositive
              ? <TrendingUp className="w-3.5 h-3.5" />
              : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{Math.abs(displayChange).toFixed(1)}% vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
}
