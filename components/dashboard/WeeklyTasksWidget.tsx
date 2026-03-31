"use client";

import { useEffect, useState } from "react";
import { Trophy, Flame, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id:    string;
  label: string;
  points: number;
}

const WEEKLY_TASKS: Task[] = [
  { id: "log_3",     label: "Log at least 3 transactions",   points: 20 },
  { id: "review",    label: "Review your weekly budget",      points: 15 },
  { id: "savings",   label: "Check your savings goal progress", points: 15 },
  { id: "all_expenses", label: "Record all today's expenses", points: 25 },
  { id: "insight",   label: "Read a financial insight",       points: 25 },
];

// Get ISO week key e.g. "2025-W13"
function weekKey(): string {
  const now  = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

const STORAGE_KEY_DONE   = "tf_tasks_done";
const STORAGE_KEY_STREAK = "tf_tasks_streak";
const STORAGE_KEY_WEEK   = "tf_tasks_week";

export default function WeeklyTasksWidget() {
  const [done,   setDone]   = useState<Set<string>>(new Set());
  const [streak, setStreak] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const storedWeek   = localStorage.getItem(STORAGE_KEY_WEEK)   ?? "";
      const storedStreak = parseInt(localStorage.getItem(STORAGE_KEY_STREAK) ?? "0", 10);
      const current      = weekKey();

      if (storedWeek !== current) {
        // New week — check if previous week was completed to maintain streak
        const prevDone = JSON.parse(localStorage.getItem(STORAGE_KEY_DONE) ?? "[]") as string[];
        const prevComplete = prevDone.length === WEEKLY_TASKS.length;
        const newStreak = prevComplete ? storedStreak + 1 : 0;
        setStreak(newStreak);
        setDone(new Set());
        localStorage.setItem(STORAGE_KEY_WEEK,   current);
        localStorage.setItem(STORAGE_KEY_DONE,   "[]");
        localStorage.setItem(STORAGE_KEY_STREAK, String(newStreak));
      } else {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY_DONE) ?? "[]") as string[];
        setDone(new Set(saved));
        setStreak(storedStreak);
      }
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  function toggleTask(id: string) {
    setDone(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);

      try {
        localStorage.setItem(STORAGE_KEY_DONE, JSON.stringify([...next]));
        // If all tasks completed for first time this week, increment streak
        if (next.size === WEEKLY_TASKS.length && prev.size < WEEKLY_TASKS.length) {
          const newStreak = streak + 1;
          setStreak(newStreak);
          localStorage.setItem(STORAGE_KEY_STREAK, String(newStreak));
        }
      } catch { /* ignore */ }

      return next;
    });
  }

  const points    = WEEKLY_TASKS.filter(t => done.has(t.id)).reduce((s, t) => s + t.points, 0);
  const maxPoints = WEEKLY_TASKS.reduce((s, t) => s + t.points, 0);
  const allDone   = done.size === WEEKLY_TASKS.length;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-5 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 leading-none">Weekly Tasks</h2>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Resets every Monday</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Streak */}
          {streak > 0 && (
            <div className="flex items-center gap-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-2.5 py-1 rounded-full">
              <Flame className="w-3.5 h-3.5" />
              <span className="text-xs font-bold">{streak}-week streak!</span>
            </div>
          )}
          {/* Points */}
          <div className="text-right">
            <p className="text-xs font-bold text-brand-600 dark:text-brand-400 font-mono">{points}/{maxPoints}</p>
            <p className="text-[10px] text-slate-400">points</p>
          </div>
        </div>
      </div>

      {/* All-done banner */}
      {allDone && (
        <div className="mb-4 rounded-xl bg-gradient-brand p-3 flex items-center gap-3 text-white">
          <span className="text-xl">🎉</span>
          <div>
            <p className="text-sm font-bold">All tasks complete!</p>
            <p className="text-xs text-white/70">Great week. See you next Monday.</p>
          </div>
        </div>
      )}

      {/* Task list */}
      {!loaded ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => <div key={i} className="h-10 skeleton rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {WEEKLY_TASKS.map(task => {
            const isChecked = done.has(task.id);
            return (
              <button
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150",
                  isChecked
                    ? "bg-brand-50 dark:bg-brand-900/20"
                    : "hover:bg-slate-50 dark:hover:bg-slate-700/50"
                )}
              >
                {isChecked
                  ? <CheckCircle2 className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0" />
                  : <Circle       className="w-5 h-5 text-slate-300 dark:text-slate-600 shrink-0" />}
                <span className={cn(
                  "flex-1 text-sm",
                  isChecked
                    ? "line-through text-slate-400 dark:text-slate-500"
                    : "text-slate-700 dark:text-slate-200"
                )}>
                  {task.label}
                </span>
                <span className={cn(
                  "text-[11px] font-bold px-1.5 py-0.5 rounded-full",
                  isChecked
                    ? "bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500"
                )}>
                  +{task.points}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
          <span>{done.size}/{WEEKLY_TASKS.length} tasks</span>
          <span>{maxPoints > 0 ? Math.round((points / maxPoints) * 100) : 0}% complete</span>
        </div>
        <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-brand rounded-full transition-all duration-500"
            style={{ width: `${maxPoints > 0 ? (points / maxPoints) * 100 : 0}%` }}
          />
        </div>
      </div>
    </div>
  );
}
