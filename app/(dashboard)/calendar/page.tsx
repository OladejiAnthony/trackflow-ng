"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  startOfMonth, endOfMonth, eachDayOfInterval,
  format, isSameDay, isToday, addMonths, subMonths, getDay,
} from "date-fns";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import { cn, formatNaira, getCategoryMeta } from "@/lib/utils";
import type { Transaction } from "@/types";

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const { user } = useAuth();

  const monthStart = format(currentMonth, "yyyy-MM-dd");
  const monthEnd   = format(endOfMonth(currentMonth), "yyyy-MM-dd");

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey:        ["calendar-transactions", user?.id, monthStart],
    enabled:         !!user?.id,
    staleTime:       30_000,
    refetchInterval: 30_000,
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user!.id)
        .gte("date", monthStart)
        .lte("date", monthEnd)
        .order("date", { ascending: true });
      return (data ?? []) as Transaction[];
    },
  });

  // Group transactions by date string (yyyy-MM-dd)
  const txByDate = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const tx of transactions) {
      const key = tx.date.split("T")[0];
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(tx);
    }
    return map;
  }, [transactions]);

  // Build calendar grid
  const days          = eachDayOfInterval({ start: currentMonth, end: endOfMonth(currentMonth) });
  const leadingBlanks = getDay(currentMonth); // 0=Sun

  // Selected day data
  const selectedKey  = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;
  const selectedTxs  = selectedKey ? (txByDate.get(selectedKey) ?? []) : [];
  const selectedNet  = selectedTxs.reduce((s, t) =>
    t.type === "income" ? s + Number(t.amount) : s - Number(t.amount), 0);

  // Upcoming recurring (next 7 days from today, if viewing current month)
  const today = new Date();
  const isCurrentMonth = format(currentMonth, "yyyy-MM") === format(today, "yyyy-MM");
  const recurringTxs = isCurrentMonth
    ? transactions.filter(t => {
        if (!t.is_recurring) return false;
        const txDay = new Date(t.date).getDate();
        const todayDay = today.getDate();
        return txDay >= todayDay && txDay <= todayDay + 7;
      })
    : [];

  const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Calendar</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">View transactions by date</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonth(m => subMonths(m, 1))}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 min-w-[120px] text-center">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <button
            onClick={() => setCurrentMonth(m => addMonths(m, 1))}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => { setCurrentMonth(startOfMonth(new Date())); setSelectedDate(new Date()); }}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors ml-1"
          >
            Today
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar grid */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-card p-4">
          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAY_LABELS.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-slate-400 dark:text-slate-500 py-1">
                {d}
              </div>
            ))}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-xl skeleton" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {/* Leading blanks */}
              {Array.from({ length: leadingBlanks }).map((_, i) => (
                <div key={`blank-${i}`} />
              ))}

              {/* Day cells */}
              {days.map(day => {
                const key  = format(day, "yyyy-MM-dd");
                const txs  = txByDate.get(key) ?? [];
                const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                const _isToday   = isToday(day);

                const incomeDots  = txs.filter(t => t.type === "income").length;
                const expenseDots = txs.filter(t => t.type === "expense").length;
                const extraDots   = txs.length > 3 ? txs.length - 3 : 0;

                return (
                  <button
                    key={key}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "relative flex flex-col items-center justify-start p-1 rounded-xl aspect-square transition-colors text-sm",
                      isSelected  && "bg-brand-500 text-white",
                      !isSelected && _isToday && "ring-2 ring-brand-400 dark:ring-brand-500",
                      !isSelected && "hover:bg-slate-50 dark:hover:bg-slate-700/50",
                      txs.length > 0 && !isSelected && "font-semibold"
                    )}
                  >
                    <span className={cn(
                      "text-xs",
                      isSelected  ? "text-white"
                      : _isToday  ? "text-brand-600 dark:text-brand-400 font-bold"
                      : "text-slate-700 dark:text-slate-200"
                    )}>
                      {format(day, "d")}
                    </span>

                    {/* Transaction dots */}
                    {txs.length > 0 && (
                      <div className="flex items-center gap-0.5 mt-0.5 flex-wrap justify-center">
                        {Array.from({ length: Math.min(3, incomeDots) }).map((_, i) => (
                          <div key={`inc-${i}`} className={cn("w-1.5 h-1.5 rounded-full", isSelected ? "bg-green-200" : "bg-green-500")} />
                        ))}
                        {Array.from({ length: Math.min(3 - Math.min(3, incomeDots), expenseDots) }).map((_, i) => (
                          <div key={`exp-${i}`} className={cn("w-1.5 h-1.5 rounded-full", isSelected ? "bg-red-200" : "bg-red-500")} />
                        ))}
                        {extraDots > 0 && (
                          <span className={cn("text-[9px] font-bold leading-none", isSelected ? "text-white/70" : "text-slate-400")}>
                            +{extraDots}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Day detail */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {selectedDate ? format(selectedDate, "MMM d, yyyy") : "Select a day"}
              </h3>
              {selectedTxs.length > 0 && (
                <span className={cn(
                  "text-xs font-bold",
                  selectedNet >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500"
                )}>
                  {selectedNet >= 0 ? "+" : ""}{formatNaira(selectedNet, { compact: true })}
                </span>
              )}
            </div>

            {selectedTxs.length === 0 ? (
              <div className="flex flex-col items-center py-6 gap-2 text-center">
                <CalendarDays className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                <p className="text-xs text-slate-400">No transactions this day</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {selectedTxs.map(tx => {
                  const meta     = getCategoryMeta(tx.category);
                  const isIncome = tx.type === "income";
                  return (
                    <div key={tx.id} className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                        style={{ backgroundColor: `${meta.color}1a` }}
                      >
                        {meta.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
                          {tx.description}
                        </p>
                        <p className="text-[10px] text-slate-400">{meta.label}</p>
                      </div>
                      <span className={cn(
                        "text-xs font-semibold font-mono shrink-0",
                        isIncome ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"
                      )}>
                        {isIncome ? "+" : "−"}{formatNaira(Number(tx.amount), { compact: true })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming recurring */}
          {recurringTxs.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-4">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
                Recurring (Next 7 Days)
              </h3>
              <div className="space-y-2">
                {recurringTxs.map(tx => {
                  const meta = getCategoryMeta(tx.category);
                  return (
                    <div key={tx.id} className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                        style={{ backgroundColor: `${meta.color}1a` }}
                      >
                        {meta.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">{tx.description}</p>
                        <p className="text-[10px] text-slate-400">{format(new Date(tx.date), "MMM d")}</p>
                      </div>
                      <span className="text-xs font-semibold font-mono text-slate-600 dark:text-slate-300 shrink-0">
                        {formatNaira(Number(tx.amount), { compact: true })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Month summary */}
          {!isLoading && transactions.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-4 space-y-2">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Month Summary</h3>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Income</span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  +{formatNaira(transactions.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0), { compact: true })}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Expenses</span>
                <span className="font-semibold text-red-500">
                  −{formatNaira(transactions.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0), { compact: true })}
                </span>
              </div>
              <div className="flex justify-between text-xs border-t border-slate-100 dark:border-slate-700 pt-2">
                <span className="text-slate-500 dark:text-slate-400">Transactions</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{transactions.length}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
