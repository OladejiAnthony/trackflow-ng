"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, ArrowLeftRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn, formatNaira, formatDate, getCategoryMeta } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/useAuth";

// Infer a simple payment method label from tags or note
function paymentTag(tags: string[] | null, note: string | null): string | null {
  const all = [...(tags ?? []), note ?? ""].join(" ").toLowerCase();
  if (all.includes("transfer") || all.includes("bank"))   return "Transfer";
  if (all.includes("pos") || all.includes("card"))        return "Card";
  if (all.includes("cash"))                               return "Cash";
  if (all.includes("ussd"))                               return "USSD";
  if (all.includes("crypto"))                             return "Crypto";
  return null;
}

export default function RecentTransactions() {
  const { user } = useAuth();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["dashboard-transactions", user?.id],
    enabled:  !!user?.id,
    staleTime: 30_000,
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user!.id)
        .order("date", { ascending: false })
        .limit(10);
      return data ?? [];
    },
  });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-5 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
          Recent Transactions
        </h2>
        <Link
          href="/transactions"
          className="flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 font-medium hover:underline underline-offset-2"
        >
          View all <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl skeleton shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-3/4 skeleton" />
                <div className="h-3 w-1/3 skeleton" />
              </div>
              <div className="h-4 w-16 skeleton" />
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex flex-col items-center py-8 gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center">
            <ArrowLeftRight className="w-6 h-6 text-slate-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No transactions yet</p>
            <p className="text-xs text-slate-400 mt-0.5">Tap the + button to record your first one.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          {transactions.map(tx => {
            const meta     = getCategoryMeta(tx.category);
            const isIncome = tx.type === "income";
            const method   = paymentTag(tx.tags, tx.note);

            return (
              <Link
                key={tx.id}
                href={`/transactions/${tx.id}`}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
              >
                {/* Category icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                  style={{ backgroundColor: `${meta.color}1a` }}
                >
                  {meta.emoji}
                </div>

                {/* Description + meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                      {tx.description}
                    </p>
                    {method && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 shrink-0">
                        {method}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    {formatDate(tx.date, "dd MMM yyyy")}
                  </p>
                </div>

                {/* Amount */}
                <p className={cn(
                  "text-sm font-semibold font-mono shrink-0",
                  isIncome ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"
                )}>
                  {isIncome ? "+" : "−"}{formatNaira(tx.amount, { compact: true })}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
