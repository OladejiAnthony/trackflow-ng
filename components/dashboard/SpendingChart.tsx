"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { PieChart as PieIcon } from "lucide-react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatNaira, getCategoryMeta, startOfCurrentMonth, endOfCurrentMonth } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/useAuth";

interface SliceEntry {
  name:    string;
  value:   number;
  emoji:   string;
  color:   string;
}

// Recharts custom tooltip
function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: SliceEntry }> }) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 shadow-card-md text-sm">
      <p className="font-semibold text-slate-800 dark:text-slate-100">{d.emoji} {d.name}</p>
      <p className="text-brand-600 dark:text-brand-400 font-mono font-bold">{formatNaira(d.value, { compact: true })}</p>
    </div>
  );
}

export default function SpendingChart() {
  const { user }   = useAuth();
  const [mounted, setMounted] = useState(false);
  const [active,  setActive]  = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  const { data: slices = [], isLoading } = useQuery({
    queryKey: ["spending-chart", user?.id],
    enabled:  !!user?.id,
    staleTime: 60_000,
    queryFn: async () => {
      const supabase = createClient();
      const start    = startOfCurrentMonth().toISOString().split("T")[0];
      const end      = endOfCurrentMonth().toISOString().split("T")[0];

      const { data } = await supabase
        .from("transactions")
        .select("category, amount")
        .eq("user_id", user!.id)
        .eq("type", "expense")
        .gte("date", start)
        .lte("date", end);

      if (!data?.length) return [];

      const map: Record<string, number> = {};
      for (const tx of data) {
        map[tx.category] = (map[tx.category] ?? 0) + tx.amount;
      }

      return Object.entries(map)
        .map(([cat, value]) => {
          const meta = getCategoryMeta(cat);
          return { name: meta.label, value, emoji: meta.emoji, color: meta.color } satisfies SliceEntry;
        })
        .sort((a, b) => b.value - a.value)
        .slice(0, 8); // top 8 categories
    },
  });

  const total = slices.reduce((s, d) => s + d.value, 0);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-5 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Spending by Category</h2>
        <Link href="/reports" className="flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 font-medium hover:underline underline-offset-2">
          Reports <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center gap-4">
          <div className="w-44 h-44 rounded-full skeleton" />
          <div className="w-full space-y-2">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-5 skeleton" />)}
          </div>
        </div>
      ) : slices.length === 0 ? (
        <div className="flex flex-col items-center py-8 gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center">
            <PieIcon className="w-6 h-6 text-slate-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No expenses this month</p>
            <p className="text-xs text-slate-400 mt-0.5">Start tracking to see your spending breakdown.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Donut chart */}
          {mounted && (
            <div className="relative h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={slices}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                    dataKey="value"
                    onMouseEnter={(_: unknown, i: number) => setActive(slices[i]?.name ?? null)}
                    onMouseLeave={() => setActive(null)}
                  >
                    {slices.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={entry.color}
                        opacity={active === null || active === entry.name ? 1 : 0.4}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-xs text-slate-400 dark:text-slate-500">Total</p>
                <p className="text-sm font-bold font-mono text-slate-700 dark:text-slate-200">{formatNaira(total, { compact: true })}</p>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="space-y-2">
            {slices.map(s => {
              const pct = total > 0 ? (s.value / total) * 100 : 0;
              return (
                <div
                  key={s.name}
                  className="flex items-center gap-2 cursor-pointer"
                  onMouseEnter={() => setActive(s.name)}
                  onMouseLeave={() => setActive(null)}
                >
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                  <span className="text-xs text-slate-600 dark:text-slate-300 flex-1 truncate">{s.emoji} {s.name}</span>
                  <span className="text-xs font-semibold font-mono text-slate-700 dark:text-slate-200">{formatNaira(s.value, { compact: true })}</span>
                  <span className="text-[10px] text-slate-400 w-8 text-right">{pct.toFixed(0)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
