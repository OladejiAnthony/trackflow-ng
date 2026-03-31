"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, Info, Sun, Moon } from "lucide-react";
import { AppButton as Button } from "@/components/ui/AppButton";
import { Alert } from "@/components/ui/Alert";
import { cn, TRANSACTION_CATEGORIES } from "@/lib/utils";
import { saveOnboardingBudget } from "../actions";

// Expense categories the user can pick from (max 5)
const EXPENSE_CATS = Object.entries(TRANSACTION_CATEGORIES)
  .filter(([, meta]) => meta.type === "expense")
  .map(([key, meta]) => ({ key, ...meta }));

const MAX_CATS = 5;

const MORNING_HOURS = [
  { value: "5",  label: "5:00 AM"  }, { value: "6",  label: "6:00 AM"  },
  { value: "7",  label: "7:00 AM"  }, { value: "8",  label: "8:00 AM"  },
  { value: "9",  label: "9:00 AM"  }, { value: "10", label: "10:00 AM" },
  { value: "11", label: "11:00 AM" },
];

const EVENING_HOURS = [
  { value: "17", label: "5:00 PM"  }, { value: "18", label: "6:00 PM"  },
  { value: "19", label: "7:00 PM"  }, { value: "20", label: "8:00 PM"  },
  { value: "21", label: "9:00 PM"  }, { value: "22", label: "10:00 PM" },
  { value: "23", label: "11:00 PM" },
];

// ─── Naira input helper ───────────────────────────────────────────────────────

function formatDisplayValue(raw: string): string {
  const num = raw.replace(/[^0-9]/g, "");
  if (!num) return "";
  return new Intl.NumberFormat("en-NG").format(parseInt(num, 10));
}

export default function SetupBudgetPage() {
  const router = useRouter();

  const [income, setIncome]           = useState("");
  const [budgetLimit, setBudgetLimit] = useState("");
  const [selected, setSelected]       = useState<string[]>([]);
  const [morningHour, setMorningHour] = useState("8");
  const [eveningHour, setEveningHour] = useState("20");
  const [error, setError]             = useState<string | null>(null);
  const [isPending, startTransition]  = useTransition();

  function toggleCategory(key: string) {
    setSelected((prev) =>
      prev.includes(key)
        ? prev.filter((k) => k !== key)
        : prev.length < MAX_CATS
        ? [...prev, key]
        : prev
    );
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      const rawIncome = income.replace(/[^0-9]/g, "");
      const rawBudget = budgetLimit.replace(/[^0-9]/g, "");
      if (rawIncome) fd.set("monthly_income", rawIncome);
      if (rawBudget) fd.set("budget_limit", rawBudget);
      selected.forEach((cat) => fd.append("categories", cat));
      fd.set("morning_hour", morningHour);
      fd.set("evening_hour", eveningHour);

      const result = await saveOnboardingBudget(fd);
      if (result?.error) {
        setError(result.error);
      } else {
        router.push(`/onboarding/grant-permissions?morning=${morningHour}&evening=${eveningHour}`);
      }
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-md"
    >
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold font-display text-white tracking-tight mb-2">
          Set your budget
        </h1>
        <p className="text-slate-400 text-sm">
          We&apos;ll use this to track your spending and alert you when you&apos;re close
        </p>
      </div>

      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/10 shadow-card-xl space-y-6 auth-panel">
        {error && <Alert variant="error">{error}</Alert>}

        {/* Monthly income */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Monthly income{" "}
            <span className="text-slate-600 font-normal">(optional)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium pointer-events-none">
              ₦
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={income}
              onChange={(e) => setIncome(formatDisplayValue(e.target.value))}
              placeholder="0"
              className="input-field pl-8"
            />
          </div>
          <p className="mt-1.5 text-xs text-slate-500">
            Used only to calculate your savings rate — never shared.
          </p>
        </div>

        {/* Monthly budget limit */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Monthly spending limit{" "}
            <span className="text-slate-600 font-normal">(optional)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium pointer-events-none">
              ₦
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={budgetLimit}
              onChange={(e) => setBudgetLimit(formatDisplayValue(e.target.value))}
              placeholder="0"
              className="input-field pl-8"
            />
          </div>
        </div>

        {/* Notification times */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-slate-300 mb-1.5">
              <Sun className="w-4 h-4 opacity-60" />
              Morning summary
            </label>
            <select
              value={morningHour}
              onChange={(e) => setMorningHour(e.target.value)}
              className="input-field"
            >
              {MORNING_HOURS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-slate-300 mb-1.5">
              <Moon className="w-4 h-4 opacity-60" />
              Evening recap
            </label>
            <select
              value={eveningHour}
              onChange={(e) => setEveningHour(e.target.value)}
              className="input-field"
            >
              {EVENING_HOURS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-300">
              Top spending categories to track
            </label>
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full font-medium",
                selected.length === MAX_CATS
                  ? "bg-gold-500/20 text-gold-400"
                  : "bg-white/10 text-slate-400"
              )}
            >
              {selected.length}/{MAX_CATS}
            </span>
          </div>

          {selected.length === MAX_CATS && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3"
              >
                <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 rounded-lg px-3 py-2">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  Maximum {MAX_CATS} categories selected. Tap one to deselect.
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          <div className="grid grid-cols-2 gap-2">
            {EXPENSE_CATS.map(({ key, label, emoji }) => {
              const isSelected = selected.includes(key);
              const isDisabled = !isSelected && selected.length >= MAX_CATS;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleCategory(key)}
                  disabled={isDisabled}
                  className={cn(
                    "flex items-center gap-2.5 p-3 rounded-xl border transition-all duration-150 text-left",
                    isSelected
                      ? "border-brand-500 bg-brand-500/10"
                      : isDisabled
                      ? "border-white/5 bg-white/[0.02] opacity-40 cursor-not-allowed"
                      : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08]"
                  )}
                >
                  <span className="text-lg flex-shrink-0">{emoji}</span>
                  <span className={cn("text-xs font-medium truncate", isSelected ? "text-white" : "text-slate-400")}>
                    {label}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 ml-auto flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2">
          <Button
            type="button"
            variant="brand"
            fullWidth
            size="lg"
            loading={isPending}
            onClick={handleSubmit}
          >
            {selected.length > 0 ? "Create Budgets & Continue" : "Continue"}
            <ArrowRight className="w-4 h-4" />
          </Button>
          <button
            type="button"
            onClick={() => router.push(`/onboarding/grant-permissions?morning=${morningHour}&evening=${eveningHour}`)}
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors py-1"
          >
            Skip for now
          </button>
        </div>
      </div>
    </motion.div>
  );
}
