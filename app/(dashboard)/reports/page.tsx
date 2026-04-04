"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
  AreaChart, Area,
} from "recharts";
import { Download, TrendingUp, TrendingDown, BarChart2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import { cn, formatNaira, getCategoryMeta } from "@/lib/utils";
import type { Transaction } from "@/types";

// ─── Types & helpers ───────────────────────────────────────────────────────────

type Period = "week" | "month" | "quarter" | "year";

const PERIOD_LABELS: Record<Period, string> = {
  week:    "This Week",
  month:   "This Month",
  quarter: "Last 3 Months",
  year:    "Last 12 Months",
};

const PERIOD_SHORT_LABELS: Record<Period, string> = {
  week: "Week", month: "Month", quarter: "3M", year: "12M",
};

function getPeriodRange(p: Period): { start: string; end: string } {
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  const now  = new Date();
  switch (p) {
    case "week": {
      const s = new Date(now); s.setDate(now.getDate() - 6);
      return { start: fmt(s), end: fmt(now) };
    }
    case "month": {
      return {
        start: fmt(new Date(now.getFullYear(), now.getMonth(), 1)),
        end:   fmt(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
      };
    }
    case "quarter": {
      const s = new Date(now); s.setMonth(now.getMonth() - 2); s.setDate(1);
      return { start: fmt(s), end: fmt(now) };
    }
    case "year": {
      const s = new Date(now); s.setFullYear(now.getFullYear() - 1); s.setDate(1);
      return { start: fmt(s), end: fmt(now) };
    }
  }
}

const TOOLTIP_STYLE = {
  contentStyle:{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, fontSize: 12 },
  labelStyle:  { color: "#94a3b8" },
  itemStyle:   { color: "#e2e8f0" },
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [period,     setPeriod]     = useState<Period>("month");
  const [activeTab,  setActiveTab]  = useState<"overview" | "categories" | "daily" | "trend">("overview");
  const [sortCol,    setSortCol]    = useState<"total" | "count" | "pct" | "budget" | "remaining">("total");
  const [exportStart, setExportStart] = useState("");
  const [exportEnd,   setExportEnd]   = useState("");

  const { user } = useAuth();

  const range = getPeriodRange(period);

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey:        ["reports-transactions", user?.id, period],
    enabled:         !!user?.id,
    staleTime:       60_000,
    refetchInterval: 30_000,
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user!.id)
        .gte("date", range.start)
        .lte("date", range.end)
        .order("date", { ascending: true });
      return (data ?? []) as Transaction[];
    },
  });

  const { data: budgets = [] } = useQuery<{ category: string; amount: number }[]>({
    queryKey:        ["reports-budgets", user?.id],
    enabled:         !!user?.id,
    staleTime:       60_000,
    refetchInterval: 30_000,
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("budgets")
        .select("category, amount")
        .eq("user_id", user!.id)
        .eq("is_active", true);
      return (data ?? []) as { category: string; amount: number }[];
    },
  });

  // ── Derived stats ──────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const income   = transactions.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
    const expenses = transactions.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
    const savings  = income > 0 ? Math.max(0, ((income - expenses) / income) * 100) : 0;

    const days     = Math.max(1, transactions.length > 0
      ? (new Date(transactions[transactions.length - 1].date).getTime() - new Date(transactions[0].date).getTime()) / 86_400_000 + 1
      : 1);
    const avgDaily = expenses / days;

    const freqMap: Record<string, number> = {};
    transactions.forEach(t => { freqMap[t.category] = (freqMap[t.category] ?? 0) + 1; });
    const mostFreq = Object.entries(freqMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

    const catMap: Record<string, number> = {};
    transactions.filter(t => t.type === "expense").forEach(t => {
      catMap[t.category] = (catMap[t.category] ?? 0) + Number(t.amount);
    });
    const biggestCat = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

    return { income, expenses, savings, avgDaily, mostFreq, biggestCat };
  }, [transactions]);

  // ── Chart data ─────────────────────────────────────────────────────────────

  const overviewData = useMemo(() => {
    const map: Record<string, { income: number; expense: number }> = {};
    transactions.forEach(t => {
      const key = period === "week"
        ? new Date(t.date).toLocaleDateString("en", { weekday: "short" })
        : period === "year" || period === "quarter"
          ? new Date(t.date).toLocaleDateString("en", { month: "short", year: "2-digit" })
          : new Date(t.date).toLocaleDateString("en", { month: "short", day: "numeric" });
      if (!map[key]) map[key] = { income: 0, expense: 0 };
      if (t.type === "income")  map[key].income  += Number(t.amount);
      else                       map[key].expense += Number(t.amount);
    });
    return Object.entries(map).map(([label, v]) => ({ label, ...v }));
  }, [transactions, period]);

  const budgetByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    budgets.forEach(b => { map[b.category] = Number(b.amount); });
    return map;
  }, [budgets]);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.filter(t => t.type === "expense").forEach(t => {
      map[t.category] = (map[t.category] ?? 0) + Number(t.amount);
    });
    const total = Object.values(map).reduce((s, v) => s + v, 0);
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([cat, amount]) => {
        const budget    = budgetByCategory[cat] ?? 0;
        const remaining = Math.max(0, budget - amount);
        return {
          name:  getCategoryMeta(cat).label,
          emoji: getCategoryMeta(cat).emoji,
          color: getCategoryMeta(cat).color,
          amount,
          pct:   total > 0 ? (amount / total) * 100 : 0,
          cat,
          budget,
          remaining,
        };
      });
  }, [transactions, budgetByCategory]);

  const dailyData = useMemo(() => {
    const map: Record<string, { expense: number; income: number }> = {};
    transactions.forEach(t => {
      const key = t.date.split("T")[0];
      if (!map[key]) map[key] = { expense: 0, income: 0 };
      if (t.type === "expense") map[key].expense += Number(t.amount);
      else                       map[key].income  += Number(t.amount);
    });
    return Object.entries(map).map(([date, v]) => ({
      date: new Date(date).toLocaleDateString("en", { month: "short", day: "numeric" }),
      ...v,
      net: v.income - v.expense,
    }));
  }, [transactions]);

  // ── Category table ─────────────────────────────────────────────────────────

  const categoryTable = useMemo(() => {
    return [...categoryData]
      .sort((a, b) => {
        if (sortCol === "total")     return b.amount    - a.amount;
        if (sortCol === "pct")       return b.pct       - a.pct;
        if (sortCol === "budget")    return b.budget    - a.budget;
        if (sortCol === "remaining") return b.remaining - a.remaining;
        return 0;
      });
  }, [categoryData, sortCol]);

  // ── Sync export date range with period ────────────────────────────────────

  useEffect(() => {
    const r = getPeriodRange(period);
    setExportStart(r.start);
    setExportEnd(r.end);
  }, [period]);

  // ── CSV export ─────────────────────────────────────────────────────────────

  function exportCSV() {
    const filtered = transactions.filter(t => {
      if (exportStart && t.date < exportStart) return false;
      if (exportEnd   && t.date > exportEnd)   return false;
      return true;
    });
    const headers = ["Date", "Type", "Category", "Description", "Amount"];
    const rows    = filtered.map(t => [
      t.date, t.type, t.category, `"${t.description.replace(/"/g, '""')}"`, t.amount,
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a   = document.createElement("a");
    a.href    = url;
    a.download = `transactions-${exportStart || period}-to-${exportEnd || "now"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const SortTh = ({ col, label }: { col: "total" | "count" | "pct" | "budget" | "remaining"; label: string }) => (
    <th
      className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 cursor-pointer hover:text-brand-500 transition-colors px-3 py-2 select-none"
      onClick={() => setSortCol(col)}
    >
      {label} {sortCol === col && "↓"}
    </th>
  );

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Reports</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Understand your financial patterns</p>
        </div>
        {/* Period tabs */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
          {(["week", "month", "quarter", "year"] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              title={PERIOD_LABELS[p]}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                period === p
                  ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              )}
            >
              {PERIOD_SHORT_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-20 rounded-xl skeleton" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard label="Total Income"    value={formatNaira(stats.income,   { compact: true })} icon={<TrendingUp  className="w-4 h-4" />} color="text-green-600 dark:text-green-400" />
          <StatCard label="Total Expenses"  value={formatNaira(stats.expenses, { compact: true })} icon={<TrendingDown className="w-4 h-4" />} color="text-red-500" />
          <StatCard label="Savings Rate"    value={`${stats.savings.toFixed(1)}%`}  icon={<BarChart2 className="w-4 h-4" />} color="text-brand-600 dark:text-brand-400" />
          <StatCard label="Avg Daily Spend" value={formatNaira(stats.avgDaily, { compact: true })} color="text-slate-700 dark:text-slate-200" />
          <StatCard label="Top Category"    value={getCategoryMeta(stats.biggestCat).emoji + " " + getCategoryMeta(stats.biggestCat).label} color="text-slate-700 dark:text-slate-200" />
          <StatCard label="Most Frequent"   value={getCategoryMeta(stats.mostFreq).emoji + " " + getCategoryMeta(stats.mostFreq).label}   color="text-slate-700 dark:text-slate-200" />
        </div>
      )}

      {/* Chart area */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-5 space-y-4">
        {/* Chart tabs */}
        <div className="flex gap-1 flex-wrap">
          {(["overview", "categories", "daily", "trend"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize",
                activeTab === tab
                  ? "bg-brand-500 text-white"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="h-64 rounded-xl skeleton" />
        ) : transactions.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
            No data for this period
          </div>
        ) : (
          <>
            {/* Overview: Income vs Expense bar chart */}
            {activeTab === "overview" && (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={overviewData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis tickFormatter={v => formatNaira(v, { compact: true })} tick={{ fontSize: 11, fill: "#64748b" }} width={60} />
                  <Tooltip formatter={(v) => formatNaira(Number(v ?? 0))} {...TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
                  <Bar dataKey="income"  fill="#22c55e" radius={[4, 4, 0, 0]} name="Income"  />
                  <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            )}

            {/* Categories: Donut pie chart */}
            {activeTab === "categories" && (
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <ResponsiveContainer width={220} height={220}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="amount"
                      nameKey="name"
                      cx="50%" cy="50%"
                      innerRadius={55} outerRadius={90}
                      paddingAngle={2}
                    >
                      {categoryData.map(entry => (
                        <Cell key={entry.cat} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => formatNaira(Number(v ?? 0))}
                      {...TOOLTIP_STYLE}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2 w-full">
                  {categoryData.map(c => (
                    <div key={c.cat} className="flex items-center gap-2">
                      <span className="text-base">{c.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate">{c.name}</span>
                          <span className="text-xs text-slate-500 shrink-0 ml-2">{c.pct.toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${c.pct}%`, backgroundColor: c.color }} />
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 shrink-0 w-16 text-right">
                        {formatNaira(c.amount, { compact: true })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Daily: Area chart */}
            {activeTab === "daily" && (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={dailyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} />
                  <YAxis tickFormatter={v => formatNaira(v, { compact: true })} tick={{ fontSize: 11, fill: "#64748b" }} width={60} />
                  <Tooltip formatter={(v) => formatNaira(Number(v ?? 0))} {...TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
                  <Area type="monotone" dataKey="income"  stroke="#22c55e" fill="url(#incGrad)" strokeWidth={2} name="Income"   />
                  <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="url(#expGrad)" strokeWidth={2} name="Expenses" />
                </AreaChart>
              </ResponsiveContainer>
            )}

            {/* Trend: Net savings area */}
            {activeTab === "trend" && (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={dailyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#1a4ff5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#1a4ff5" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} />
                  <YAxis tickFormatter={v => formatNaira(v, { compact: true })} tick={{ fontSize: 11, fill: "#64748b" }} width={60} />
                  <Tooltip formatter={(v) => formatNaira(Number(v ?? 0))} {...TOOLTIP_STYLE} />
                  <Area type="monotone" dataKey="net" stroke="#1a4ff5" fill="url(#netGrad)" strokeWidth={2} name="Net Savings" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </>
        )}
      </div>

      {/* Category breakdown table */}
      {!isLoading && categoryTable.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Category Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-5 py-2">Category</th>
                  <SortTh col="budget"    label="Budget" />
                  <SortTh col="total"     label="Spent" />
                  <SortTh col="remaining" label="Remaining" />
                  <SortTh col="pct"       label="%" />
                </tr>
              </thead>
              <tbody>
                {categoryTable.map((c, idx) => (
                  <tr
                    key={c.cat}
                    className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-8 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                        <span className="text-base">{c.emoji}</span>
                        <span className="font-medium text-slate-700 dark:text-slate-200">{c.name}</span>
                        {idx === 0 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">Highest</span>}
                      </div>
                    </td>
                    <td className="text-right px-3 py-3 font-mono text-slate-500 dark:text-slate-400">
                      {c.budget > 0 ? formatNaira(c.budget, { compact: true }) : <span className="text-slate-300 dark:text-slate-600">—</span>}
                    </td>
                    <td className="text-right px-3 py-3 font-mono font-semibold text-slate-700 dark:text-slate-200">
                      {formatNaira(c.amount, { compact: true })}
                    </td>
                    <td className="text-right px-3 py-3 font-mono">
                      {c.budget > 0 ? (
                        <span className={c.remaining === 0 ? "text-red-500" : "text-green-600 dark:text-green-400"}>
                          {formatNaira(c.remaining, { compact: true })}
                        </span>
                      ) : <span className="text-slate-300 dark:text-slate-600">—</span>}
                    </td>
                    <td className="text-right px-3 py-3">
                      <span className="text-slate-500 dark:text-slate-400">{c.pct.toFixed(1)}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Export */}
      <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Export range:</span>
        <input
          type="date"
          value={exportStart}
          onChange={e => setExportStart(e.target.value)}
          className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
        <span className="text-xs text-slate-400">to</span>
        <input
          type="date"
          value={exportEnd}
          onChange={e => setExportEnd(e.target.value)}
          className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
      </div>
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <Download className="w-4 h-4" /> Export PDF
        </button>
      </div>
      </div>
    </div>
  );
}

// ─── StatCard ──────────────────────────────────────────────────────────────────

function StatCard({
  label, value, icon, color,
}: { label: string; value: string; icon?: React.ReactNode; color: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-card p-4">
      <div className="flex items-center gap-1.5 mb-1">
        {icon && <span className={cn("opacity-70", color)}>{icon}</span>}
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      </div>
      <p className={cn("text-base font-bold truncate", color)}>{value}</p>
    </div>
  );
}
