"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Target, X, AlertTriangle } from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import { Input } from "@/components/ui/Input";
import {
  cn, formatNaira, clampPercent, getCategoryMeta, TRANSACTION_CATEGORIES,
} from "@/lib/utils";
import {
  useBudgets, useAddBudget, useUpdateBudget, useDeleteBudget,
} from "@/lib/hooks/useBudgets";
import type { BudgetFull } from "@/lib/hooks/useBudgets";
import type { TransactionCategory } from "@/lib/utils";

// ─── Constants ─────────────────────────────────────────────────────────────────

const EXPENSE_CATS = Object.entries(TRANSACTION_CATEGORIES)
  .filter(([, m]) => m.type === "expense")
  .map(([key, meta]) => ({ key, ...meta }));

const RING_R    = 54;
const RING_CIRC = 2 * Math.PI * RING_R;

// ─── Form schema ───────────────────────────────────────────────────────────────

const schema = z.object({
  category:       z.string().min(1, "Select a category"),
  name:           z.string().min(2, "Name is required"),
  amount:         z.number({ message: "Enter a valid amount" }).positive("Enter a valid amount"),
  period:         z.enum(["weekly", "monthly"] as const),
  alertThreshold: z.number().min(50).max(100),
});
type FormValues = z.infer<typeof schema>;

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function BudgetsPage() {
  const [open, setOpen]       = useState(false);
  const [editing, setEditing] = useState<BudgetFull | null>(null);

  const { data: budgets = [], isLoading } = useBudgets();
  const addBudget    = useAddBudget();
  const updateBudget = useUpdateBudget();
  const deleteBudget = useDeleteBudget();

  const now           = new Date();
  const totalAmount   = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent    = budgets.reduce((s, b) => s + b.spent,  0);
  const overPct       = totalAmount > 0 ? clampPercent((totalSpent / totalAmount) * 100) : 0;
  const daysInMonth   = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - now.getDate();

  function openEdit(b: BudgetFull) { setEditing(b); setOpen(true); }
  function closeModal()            { setOpen(false); setEditing(null); }

  async function handleDelete(b: BudgetFull) {
    if (!confirm(`Delete "${b.name}"?`)) return;
    deleteBudget.mutate(b.id);
  }

  async function handleSubmit(vals: FormValues) {
    const start = new Date(now.getFullYear(), now.getMonth(),     1).toISOString().split("T")[0];
    const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
    const payload = {
      category:        vals.category,
      name:            vals.name,
      amount:          vals.amount,
      period:          vals.period,
      alert_threshold: vals.alertThreshold,
      start_date:      start,
      end_date:        end,
    };
    if (editing) {
      await updateBudget.mutateAsync({ id: editing.id, data: payload });
    } else {
      await addBudget.mutateAsync({ ...payload, is_active: true });
    }
    closeModal();
  }

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Budgets</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Control your spending limits</p>
        </div>
        <AppButton onClick={() => { setEditing(null); setOpen(true); }} size="md">
          <Plus className="w-4 h-4" /> New Budget
        </AppButton>
      </div>

      {isLoading ? (
        <BudgetsSkeletons />
      ) : budgets.length === 0 ? (
        <BudgetsEmpty onNew={() => { setEditing(null); setOpen(true); }} />
      ) : (
        <>
          {/* Overview ring card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* SVG Ring */}
              <div className="relative shrink-0">
                <svg width="128" height="128" viewBox="0 0 128 128">
                  <circle cx="64" cy="64" r={RING_R} fill="none" strokeWidth="12"
                    className="stroke-slate-100 dark:stroke-slate-700" />
                  <motion.circle
                    cx="64" cy="64" r={RING_R}
                    fill="none" strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={RING_CIRC}
                    initial={{ strokeDashoffset: RING_CIRC }}
                    animate={{ strokeDashoffset: RING_CIRC * (1 - overPct / 100) }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className={cn(
                      overPct >= 90 ? "stroke-red-500"
                      : overPct >= 70 ? "stroke-yellow-500"
                      : "stroke-brand-500"
                    )}
                    transform="rotate(-90 64 64)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{overPct.toFixed(0)}%</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">used</span>
                </div>
              </div>

              {/* Stats grid */}
              <div className="flex-1 grid grid-cols-3 gap-4 text-center sm:text-left w-full">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Total Spent</p>
                  <p className="text-base font-bold text-slate-800 dark:text-slate-100">{formatNaira(totalSpent, { compact: true })}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Total Budget</p>
                  <p className="text-base font-bold text-slate-800 dark:text-slate-100">{formatNaira(totalAmount, { compact: true })}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Days Left</p>
                  <p className="text-base font-bold text-slate-800 dark:text-slate-100">{daysRemaining}d</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Remaining</p>
                  <p className="text-base font-bold text-green-600 dark:text-green-400">
                    {formatNaira(Math.max(0, totalAmount - totalSpent), { compact: true })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Active</p>
                  <p className="text-base font-bold text-slate-800 dark:text-slate-100">{budgets.length}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Over Budget</p>
                  <p className="text-base font-bold text-red-500">
                    {budgets.filter(b => b.isOverBudget).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Budget cards grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {budgets.map(b => (
              <BudgetCard
                key={b.id}
                budget={b}
                onEdit={() => openEdit(b)}
                onDelete={() => handleDelete(b)}
              />
            ))}
          </div>
        </>
      )}

      {/* Form modal */}
      <AnimatePresence>
        {open && (
          <BudgetFormModal
            editing={editing}
            onClose={closeModal}
            onSubmit={handleSubmit}
            isPending={addBudget.isPending || updateBudget.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── BudgetCard ────────────────────────────────────────────────────────────────

function BudgetCard({
  budget, onEdit, onDelete,
}: { budget: BudgetFull; onEdit: () => void; onDelete: () => void }) {
  const meta      = getCategoryMeta(budget.category);
  const pct       = budget.percentage;
  const isWarning = pct >= budget.alert_threshold && !budget.isOverBudget;

  const barColor = budget.isOverBudget ? "bg-red-500" : pct >= 70 ? "bg-yellow-500" : "bg-brand-500";
  const pctColor = budget.isOverBudget ? "text-red-500" : pct >= 70 ? "text-yellow-600 dark:text-yellow-400" : "text-slate-400 dark:text-slate-500";

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-5 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ backgroundColor: `${meta.color}1a` }}
          >
            {meta.emoji}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{budget.name}</p>
            <p className="text-xs text-slate-400 capitalize">{budget.period}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {(isWarning || budget.isOverBudget) && (
            <AlertTriangle className={cn("w-4 h-4 mr-0.5", budget.isOverBudget ? "text-red-500" : "text-yellow-500")} />
          )}
          <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-brand-500 transition-colors">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-200">
          {formatNaira(budget.spent, { compact: true })} spent
        </span>
        <span className="text-slate-400">of {formatNaira(budget.amount, { compact: true })}</span>
      </div>

      <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full", barColor)}
          initial={{ width: 0 }}
          animate={{ width: `${clampPercent(pct)}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      <div className="flex items-center justify-between">
        <p className={cn("text-xs font-medium", pctColor)}>
          {pct.toFixed(0)}% used
          {budget.isOverBudget && " — Over budget!"}
          {isWarning && !budget.isOverBudget && ` — ⚠ Alert at ${budget.alert_threshold}%`}
        </p>
        <p className="text-xs text-slate-400">
          {formatNaira(Math.max(0, budget.remaining), { compact: true })} left
        </p>
      </div>
    </div>
  );
}

// ─── BudgetFormModal ───────────────────────────────────────────────────────────

function BudgetFormModal({
  editing, onClose, onSubmit, isPending,
}: {
  editing: BudgetFull | null;
  onClose: () => void;
  onSubmit: (vals: FormValues) => Promise<void>;
  isPending: boolean;
}) {
  const {
    register, handleSubmit, control, watch, setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: editing ? {
      category:       editing.category,
      name:           editing.name,
      amount:         editing.amount,
      period:         editing.period as "weekly" | "monthly",
      alertThreshold: editing.alert_threshold,
    } : {
      category:       "",
      name:           "",
      amount:         undefined,
      period:         "monthly",
      alertThreshold: 80,
    },
  });

  const watchedCategory  = watch("category");
  const watchedThreshold = watch("alertThreshold");

  useEffect(() => {
    if (watchedCategory && !editing) {
      const meta = TRANSACTION_CATEGORIES[watchedCategory as TransactionCategory];
      if (meta) setValue("name", meta.label);
    }
  }, [watchedCategory, editing, setValue]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md space-y-5"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            {editing ? "Edit Budget" : "New Budget"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Category
            </label>
            <select {...register("category")} className="input-field">
              <option value="">Select a category</option>
              {EXPENSE_CATS.map(c => (
                <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>}
          </div>

          {/* Name */}
          <Input
            label="Budget Name"
            placeholder="e.g. Food Budget"
            {...register("name")}
            error={errors.name?.message}
          />

          {/* Amount */}
          <Input
            label="Budget Amount (₦)"
            type="number"
            placeholder="50000"
            {...register("amount", { valueAsNumber: true })}
            error={errors.amount?.message}
          />

          {/* Period toggle */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Period</label>
            <Controller
              name="period"
              control={control}
              render={({ field }) => (
                <div className="flex gap-2">
                  {(["monthly", "weekly"] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => field.onChange(p)}
                      className={cn(
                        "flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors",
                        field.value === p
                          ? "bg-brand-500 text-white"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                      )}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>

          {/* Alert threshold */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Alert Threshold</label>
              <span className="text-sm font-bold text-brand-600 dark:text-brand-400">{watchedThreshold}%</span>
            </div>
            <input
              type="range"
              min={50} max={100} step={5}
              {...register("alertThreshold", { valueAsNumber: true })}
              className="w-full accent-brand-500 cursor-pointer"
            />
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Alert me when I reach {watchedThreshold}% of my budget
            </p>
          </div>

          <AppButton type="submit" fullWidth loading={isPending}>
            {editing ? "Save Changes" : "Create Budget"}
          </AppButton>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Skeletons & Empty ─────────────────────────────────────────────────────────

function BudgetsSkeletons() {
  return (
    <div className="space-y-4">
      <div className="h-40 rounded-2xl skeleton" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 rounded-2xl skeleton" />)}
      </div>
    </div>
  );
}

function BudgetsEmpty({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center py-20 gap-4 text-center">
      <div className="w-16 h-16 rounded-full bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
        <Target className="w-8 h-8 text-brand-500" />
      </div>
      <div>
        <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">No budgets yet</p>
        <p className="text-sm text-slate-400 mt-1">Set spending limits to stay on track this month.</p>
      </div>
      <AppButton onClick={onNew}>
        <Plus className="w-4 h-4" /> Create your first budget
      </AppButton>
    </div>
  );
}
