"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Target } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn, clampPercent, formatNaira, percentage } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/useAuth";

export default function BudgetProgress() {
  const { user } = useAuth();

  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ["dashboard-budgets", user?.id],
    enabled:  !!user?.id,
    staleTime: 60_000,
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", user!.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(3);
      return data ?? [];
    },
  });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-5 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Budget Overview</h2>
        <Link href="/budgets" className="flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 font-medium hover:underline underline-offset-2">
          View all <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-3/4 skeleton" />
              <div className="h-2 w-full skeleton rounded-full" />
            </div>
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <div className="flex flex-col items-center py-8 gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
            <Target className="w-6 h-6 text-brand-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No active budgets</p>
            <p className="text-xs text-slate-400 mt-0.5">Set spending limits to stay on track.</p>
          </div>
          <Link href="/budgets" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline underline-offset-2">
            Create your first budget →
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {budgets.map(budget => {
            const pct      = percentage(budget.spent, budget.amount);
            const barColor =
              pct >= 90 ? "bg-red-500"
              : pct >= 70 ? "bg-gold-500"
              : "bg-brand-500";
            const pctColor =
              pct >= 90 ? "text-red-500"
              : pct >= 70 ? "text-gold-600 dark:text-gold-400"
              : "text-slate-400 dark:text-slate-500";

            return (
              <div key={budget.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate pr-4">
                    {budget.name}
                  </p>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                    {formatNaira(budget.spent, { compact: true })} / {formatNaira(budget.amount, { compact: true })}
                  </p>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-700", barColor)}
                    style={{ width: `${clampPercent(pct)}%` }}
                  />
                </div>
                <p className={cn("text-[11px] mt-1 font-medium", pctColor)}>
                  {pct.toFixed(0)}% used
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
