"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, PiggyBank, X, ChevronDown, ChevronUp } from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import { Input } from "@/components/ui/Input";
import { cn, formatNaira, clampPercent } from "@/lib/utils";
import {
  useGoals, useAddGoal, useUpdateGoal, useDeleteGoal, useAddMoneyToGoal,
} from "@/lib/hooks/useGoals";
import type { GoalFull } from "@/lib/hooks/useGoals";

// ─── Constants ─────────────────────────────────────────────────────────────────

const GOAL_ICONS   = ["🏠", "🚗", "🎓", "✈️", "💍", "📱", "👶", "🏥", "🌍", "💻", "🎯", "💰"];
const GOAL_COLORS  = ["#1a4ff5", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

// ─── Form schemas ──────────────────────────────────────────────────────────────

const goalSchema = z.object({
  name:          z.string().min(2, "Name is required"),
  target_amount: z.number({ message: "Enter a valid target" }).positive("Enter a valid target"),
  current_amount:z.number().min(0).optional(),
  target_date:   z.string().min(1, "Select a target date"),
  icon:          z.string().optional(),
  color:         z.string().optional(),
});
type GoalForm = z.infer<typeof goalSchema>;

const addMoneySchema = z.object({
  amount: z.number({ message: "Enter a valid amount" }).positive("Enter a valid amount"),
});
type AddMoneyForm = z.infer<typeof addMoneySchema>;

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function SavingsPage() {
  const [goalModal, setGoalModal] = useState<{ open: boolean; goal: GoalFull | null }>({
    open: false, goal: null,
  });
  const [addMoneyModal, setAddMoneyModal] = useState<{
    open: boolean; goalId: string; goalName: string; currentAmount: number; targetAmount: number;
  } | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  const { data: goals = [], isLoading } = useGoals();
  const addGoal    = useAddGoal();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();
  const addMoney   = useAddMoneyToGoal();

  const active    = goals.filter(g => !g.is_completed);
  const completed = goals.filter(g => g.is_completed);

  const totalSaved  = active.reduce((s, g) => s + g.current_amount, 0);
  const totalTarget = active.reduce((s, g) => s + g.target_amount,  0);
  const onTrack     = active.filter(g => g.daysLeft > 0 && g.percentage < 100).length;

  function openNew()         { setGoalModal({ open: true, goal: null }); }
  function openEdit(g: GoalFull) { setGoalModal({ open: true, goal: g  }); }
  function closeGoalModal()  { setGoalModal({ open: false, goal: null }); }

  async function handleDeleteGoal(g: GoalFull) {
    if (!confirm(`Delete "${g.name}"?`)) return;
    deleteGoal.mutate(g.id);
  }

  async function handleGoalSubmit(vals: GoalForm) {
    const payload = {
      name:           vals.name,
      target_amount:  vals.target_amount,
      current_amount: vals.current_amount ?? 0,
      target_date:    vals.target_date,
      icon:           vals.icon ?? "🎯",
      color:          vals.color ?? "#1a4ff5",
      category:       "savings",
    };
    if (goalModal.goal) {
      await updateGoal.mutateAsync({ id: goalModal.goal.id, data: payload });
    } else {
      await addGoal.mutateAsync(payload);
    }
    closeGoalModal();
  }

  async function handleAddMoney(vals: AddMoneyForm) {
    if (!addMoneyModal) return;
    await addMoney.mutateAsync({
      goalId:        addMoneyModal.goalId,
      goalName:      addMoneyModal.goalName,
      amount:        vals.amount,
      currentAmount: addMoneyModal.currentAmount,
      targetAmount:  addMoneyModal.targetAmount,
    });
    setAddMoneyModal(null);
  }

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Savings Goals</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Track your financial milestones</p>
        </div>
        <AppButton onClick={openNew} size="md">
          <Plus className="w-4 h-4" /> New Goal
        </AppButton>
      </div>

      {/* Summary strip */}
      {!isLoading && goals.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Saved",   value: formatNaira(totalSaved,  { compact: true }), color: "text-green-600 dark:text-green-400" },
            { label: "Total Target",  value: formatNaira(totalTarget, { compact: true }), color: "text-slate-800 dark:text-slate-100" },
            { label: "Goals On Track",value: `${onTrack}`,                                 color: "text-brand-600 dark:text-brand-400" },
            { label: "Completed",     value: `${completed.length}`,                        color: "text-gold-600 dark:text-gold-400"   },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-slate-800 rounded-xl shadow-card p-4 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
              <p className={cn("text-xl font-bold mt-0.5", s.color)}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Goals */}
      {isLoading ? (
        <GoalsSkeletons />
      ) : active.length === 0 && completed.length === 0 ? (
        <GoalsEmpty onNew={openNew} />
      ) : (
        <>
          {active.length === 0 ? null : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {active.map(g => (
                <GoalCard
                  key={g.id}
                  goal={g}
                  onEdit={() => openEdit(g)}
                  onDelete={() => handleDeleteGoal(g)}
                  onAddMoney={() => setAddMoneyModal({
                    open: true,
                    goalId:        g.id,
                    goalName:      g.name,
                    currentAmount: g.current_amount,
                    targetAmount:  g.target_amount,
                  })}
                />
              ))}
            </div>
          )}

          {/* Completed section */}
          {completed.length > 0 && (
            <div>
              <button
                onClick={() => setShowCompleted(s => !s)}
                className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 mb-3 hover:text-brand-500 transition-colors"
              >
                {showCompleted ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                Completed Goals ({completed.length})
              </button>
              <AnimatePresence>
                {showCompleted && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden"
                  >
                    {completed.map(g => (
                      <GoalCard
                        key={g.id}
                        goal={g}
                        onEdit={() => openEdit(g)}
                        onDelete={() => handleDeleteGoal(g)}
                        onAddMoney={() => {}}
                        isCompleted
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      {/* Goal form modal */}
      <AnimatePresence>
        {goalModal.open && (
          <GoalFormModal
            editing={goalModal.goal}
            onClose={closeGoalModal}
            onSubmit={handleGoalSubmit}
            isPending={addGoal.isPending || updateGoal.isPending}
          />
        )}
      </AnimatePresence>

      {/* Add money modal */}
      <AnimatePresence>
        {addMoneyModal && (
          <AddMoneyModal
            goalName={addMoneyModal.goalName}
            onClose={() => setAddMoneyModal(null)}
            onSubmit={handleAddMoney}
            isPending={addMoney.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── GoalCard ──────────────────────────────────────────────────────────────────

function GoalCard({
  goal, onEdit, onDelete, onAddMoney, isCompleted = false,
}: {
  goal: GoalFull;
  onEdit: () => void;
  onDelete: () => void;
  onAddMoney: () => void;
  isCompleted?: boolean;
}) {
  const color    = goal.color ?? "#1a4ff5";
  const icon     = goal.icon  ?? "🎯";
  const daysLeft = goal.daysLeft;

  const daysColor = daysLeft <= 7  ? "text-red-500"
    : daysLeft <= 30 ? "text-yellow-600 dark:text-yellow-400"
    : "text-slate-500 dark:text-slate-400";

  return (
    <div className={cn("bg-white dark:bg-slate-800 rounded-2xl shadow-card p-5 space-y-3", isCompleted && "opacity-70")}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0"
            style={{ backgroundColor: `${color}1a` }}
          >
            {icon}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{goal.name}</p>
            {isCompleted ? (
              <span className="text-xs font-medium text-green-600 dark:text-green-400">✓ Completed!</span>
            ) : (
              <>
                <p className={cn("text-xs", daysColor)}>{daysLeft} days left</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  by {new Date(goal.target_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-brand-500 transition-colors">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Amounts + % */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-800 dark:text-slate-100">
          {formatNaira(goal.current_amount, { compact: true })}
        </span>
        <span className="text-slate-400">of {formatNaira(goal.target_amount, { compact: true })}</span>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${clampPercent(goal.percentage)}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">
          {goal.percentage.toFixed(0)}% · {formatNaira(goal.remaining, { compact: true })} to go
        </p>
        {!isCompleted && (
          <button
            onClick={onAddMoney}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline underline-offset-2"
          >
            + Add Money
          </button>
        )}
      </div>
    </div>
  );
}

// ─── GoalFormModal ─────────────────────────────────────────────────────────────

function GoalFormModal({
  editing, onClose, onSubmit, isPending,
}: {
  editing: GoalFull | null;
  onClose: () => void;
  onSubmit: (vals: GoalForm) => Promise<void>;
  isPending: boolean;
}) {
  const [selectedIcon,  setSelectedIcon]  = useState(editing?.icon  ?? "🎯");
  const [selectedColor, setSelectedColor] = useState(editing?.color ?? "#1a4ff5");

  const {
    register, handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<GoalForm>({
    resolver: zodResolver(goalSchema),
    defaultValues: editing ? {
      name:           editing.name,
      target_amount:  editing.target_amount,
      current_amount: editing.current_amount,
      target_date:    editing.target_date,
      icon:           editing.icon  ?? "🎯",
      color:          editing.color ?? "#1a4ff5",
    } : {
      name:           "",
      target_amount:  undefined,
      current_amount: 0,
      target_date:    "",
      icon:           "🎯",
      color:          "#1a4ff5",
    },
  });

  function pickIcon(i: string)  { setSelectedIcon(i);  setValue("icon",  i); }
  function pickColor(c: string) { setSelectedColor(c); setValue("color", c); }

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
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto space-y-5"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            {editing ? "Edit Goal" : "New Goal"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Goal Title" placeholder="e.g. New Laptop" {...register("name")} error={errors.name?.message} />
          <Input label="Target Amount (₦)" type="number" placeholder="200000" {...register("target_amount", { valueAsNumber: true })} error={errors.target_amount?.message} />
          <Input label="Already Saved (₦)" type="number" placeholder="0" {...register("current_amount", { valueAsNumber: true })} error={errors.current_amount?.message} />
          <Input label="Target Date" type="date" {...register("target_date")} error={errors.target_date?.message} />

          {/* Icon picker */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Icon</label>
            <div className="flex flex-wrap gap-2">
              {GOAL_ICONS.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => pickIcon(icon)}
                  className={cn(
                    "w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all",
                    selectedIcon === icon
                      ? "ring-2 ring-brand-500 bg-brand-50 dark:bg-brand-900/20"
                      : "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
                  )}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Color</label>
            <div className="flex gap-3">
              {GOAL_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => pickColor(c)}
                  className={cn(
                    "w-8 h-8 rounded-full transition-transform",
                    selectedColor === c ? "ring-2 ring-offset-2 ring-slate-400 scale-110" : "hover:scale-105"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <AppButton type="submit" fullWidth loading={isPending}>
            {editing ? "Save Changes" : "Create Goal"}
          </AppButton>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── AddMoneyModal ─────────────────────────────────────────────────────────────

function AddMoneyModal({
  goalName, onClose, onSubmit, isPending,
}: {
  goalName: string;
  onClose: () => void;
  onSubmit: (vals: AddMoneyForm) => Promise<void>;
  isPending: boolean;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<AddMoneyForm>({
    resolver: zodResolver(addMoneySchema),
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-sm space-y-5"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Add Money</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Add funds to <span className="font-semibold text-slate-700 dark:text-slate-200">{goalName}</span>.
          This will be recorded as a savings transaction.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Amount (₦)" type="number" placeholder="5000" {...register("amount", { valueAsNumber: true })} error={errors.amount?.message} />
          <AppButton type="submit" fullWidth loading={isPending}>Add to Goal</AppButton>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function GoalsSkeletons() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-36 rounded-2xl skeleton" />)}
    </div>
  );
}

function GoalsEmpty({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center py-20 gap-4 text-center">
      <div className="w-16 h-16 rounded-full bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
        <PiggyBank className="w-8 h-8 text-brand-500" />
      </div>
      <div>
        <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">No savings goals yet</p>
        <p className="text-sm text-slate-400 mt-1">Create a goal and start saving toward it.</p>
      </div>
      <AppButton onClick={onNew}>
        <Plus className="w-4 h-4" /> Create your first goal
      </AppButton>
    </div>
  );
}
