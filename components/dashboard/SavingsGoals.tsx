"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PiggyBank, ChevronRight, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatNaira } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/useAuth";
import { cn } from "@/lib/utils";

const GOAL_COLORS = [
  "#0A6E5E", "#F5A623", "#3B82F6", "#8B5CF6",
  "#EC4899", "#10B981", "#F59E0B", "#EF4444",
];

function getColor(index: number, stored: string | null): string {
  return stored ?? GOAL_COLORS[index % GOAL_COLORS.length];
}

export default function SavingsGoals() {
  const { user } = useAuth();
  const router   = useRouter();

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["dashboard-goals", user?.id],
    enabled:  !!user?.id,
    staleTime: 60_000,
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user!.id)
        .eq("is_completed", false)
        .order("target_date", { ascending: true })
        .limit(4);
      return data ?? [];
    },
  });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-5 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
            <PiggyBank className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          </div>
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Savings Goals</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/savings")}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 text-xs font-medium hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Goal
          </button>
          <Link
            href="/savings"
            className="flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 font-medium hover:underline underline-offset-2"
          >
            View all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <div className="h-4 w-32 skeleton" />
                <div className="h-4 w-20 skeleton" />
              </div>
              <div className="h-2 skeleton rounded-full" />
            </div>
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="flex flex-col items-center py-8 gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center">
            <PiggyBank className="w-6 h-6 text-slate-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No active goals</p>
            <p className="text-xs text-slate-400 mt-0.5">Set a savings goal to stay motivated.</p>
          </div>
          <button
            onClick={() => router.push("/savings")}
            className="mt-1 px-4 py-1.5 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors"
          >
            Create First Goal
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal, i) => {
            const pct     = goal.target_amount > 0
              ? Math.min((goal.current_amount / goal.target_amount) * 100, 100)
              : 0;
            const color   = getColor(i, goal.color);
            const daysLeft = goal.target_date
              ? Math.max(0, Math.ceil((new Date(goal.target_date).getTime() - Date.now()) / 86400000))
              : null;

            return (
              <Link
                key={goal.id}
                href="/savings"
                className="block group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{goal.icon ?? "🎯"}</span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate max-w-[140px]">
                      {goal.name}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold font-mono text-slate-700 dark:text-slate-200">
                      {formatNaira(goal.current_amount, { compact: true })}
                      <span className="text-slate-400 font-normal"> / {formatNaira(goal.target_amount, { compact: true })}</span>
                    </p>
                    {daysLeft !== null && (
                      <p className={cn(
                        "text-[10px]",
                        daysLeft <= 7 ? "text-red-500" : daysLeft <= 30 ? "text-amber-500" : "text-slate-400"
                      )}>
                        {daysLeft === 0 ? "Due today" : `${daysLeft}d left`}
                      </p>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 text-right">{pct.toFixed(0)}%</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
