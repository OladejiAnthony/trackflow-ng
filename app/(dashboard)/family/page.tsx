"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  Users, Plus, Copy, Trash2, X, Home, LogIn,
  TrendingUp, TrendingDown, Wallet, Check,
  PiggyBank, AlertTriangle,
} from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  useMyFamily, useFamilyMembers, usePendingInvites,
  useCreateFamily, useGenerateInvite, useRemoveMember,
} from "@/lib/hooks/useFamily";
import type { FamilyMemberWithProfile } from "@/lib/hooks/useFamily";
import type { FamilyGroup, FamilyInvite } from "@/types";
import { AppButton } from "@/components/ui/AppButton";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { formatNaira, getCategoryMeta, initials, colorFromString, clampPercent, cn } from "@/lib/utils";
import { useBudgets, type BudgetFull } from "@/lib/hooks/useBudgets";
import { useGoals,   type GoalFull   } from "@/lib/hooks/useGoals";

// ─── Types ────────────────────────────────────────────────────────────────────

type EnrichedTransaction = {
  id: string;
  user_id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string;
  member: { id: string; full_name: string | null; avatar_url: string | null; email: string } | null;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const TOOLTIP_STYLE = {
  contentStyle: { background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, fontSize: 12 },
  labelStyle:   { color: "#94a3b8" },
  itemStyle:    { color: "#e2e8f0" },
};

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const createFamilySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
});
type CreateFamilyForm = z.infer<typeof createFamilySchema>;

const joinFamilySchema = z.object({
  code: z.string().min(6, "Enter a valid invite code").max(12),
});
type JoinFamilyForm = z.infer<typeof joinFamilySchema>;

// ─── Shared Sub-components ───────────────────────────────────────────────────

function KPICard({ label, value, icon, gradient, prefix = "" }: {
  label: string; value: number; icon: React.ReactNode; gradient: string; prefix?: string;
}) {
  return (
    <div className={cn("rounded-2xl p-5 text-white shadow-card-lg relative overflow-hidden", gradient)}>
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">{icon}</div>
          <p className="text-xs text-white/75 font-medium">{label}</p>
        </div>
        <p className="text-2xl lg:text-3xl font-bold font-mono tracking-tight">
          {prefix}{formatNaira(value)}
        </p>
      </div>
    </div>
  );
}

function MemberAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const bg = colorFromString(name);
  const sizeMap = { sm: "w-7 h-7 text-[10px]", md: "w-10 h-10 text-xs", lg: "w-12 h-12 text-sm" };
  return (
    <div
      className={cn("rounded-full flex items-center justify-center font-bold text-white shrink-0", sizeMap[size])}
      style={{ backgroundColor: bg }}
    >
      {initials(name)}
    </div>
  );
}

function RemoveConfirmModal({ member, isPending, onConfirm, onClose }: {
  member: FamilyMemberWithProfile | null;
  isPending: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const name = member?.profile.full_name ?? member?.profile.email ?? "this member";
  return (
    <AnimatePresence>
      {member && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Remove Member</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to remove <strong>{name}</strong> from this family group?
              They will lose access to shared data.
            </p>
            <div className="flex gap-3">
              <AppButton variant="outline" fullWidth onClick={onClose}>Cancel</AppButton>
              <AppButton variant="danger" fullWidth loading={isPending} onClick={onConfirm}>Remove</AppButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FamilyPage() {
  const profile = useAppStore((s) => s.profile);
  const { data: family, isLoading: familyLoading } = useMyFamily();

  if (!profile) return null;

  if (profile.account_type !== "family") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 px-4 text-center">
        <Users className="w-12 h-12 text-slate-300 dark:text-slate-600" />
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Family module not available</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">This section is only for Family accounts.</p>
      </div>
    );
  }

  if (familyLoading) {
    return (
      <div className="p-4 lg:p-8 space-y-6 max-w-5xl mx-auto">
        <div className="h-10 w-48 rounded-xl skeleton" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-28 rounded-2xl skeleton" />)}
        </div>
        <div className="h-64 rounded-2xl skeleton" />
      </div>
    );
  }

  if (!family) return <SetupScreen />;
  return <FamilyDashboard family={family} />;
}

// ─── SetupScreen ──────────────────────────────────────────────────────────────

function SetupScreen() {
  const [activeOption, setActiveOption] = useState<"create" | "join" | null>(null);
  const [joinError, setJoinError]       = useState<string | null>(null);
  const [joinLoading, setJoinLoading]   = useState(false);

  const createFamily = useCreateFamily();
  const queryClient  = useQueryClient();
  const { user }     = useAuth();

  const {
    register: createRegister,
    handleSubmit: handleCreateSubmit,
    formState: { errors: createErrors },
  } = useForm<CreateFamilyForm>({ resolver: zodResolver(createFamilySchema) });

  const {
    register: joinRegister,
    handleSubmit: handleJoinSubmit,
    formState: { errors: joinErrors },
    watch: joinWatch,
  } = useForm<JoinFamilyForm>({ resolver: zodResolver(joinFamilySchema) });

  async function onCreateFamily(data: CreateFamilyForm) {
    createFamily.mutate(data.name);
  }

  async function onJoinFamily(data: JoinFamilyForm) {
    setJoinLoading(true);
    setJoinError(null);
    try {
      const res = await fetch("/api/family/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: data.code.toUpperCase() }),
      });
      const json = await res.json();
      if (!res.ok) {
        setJoinError(json.error ?? "Failed to join family");
        return;
      }
      toast.success("Joined family successfully!");
      queryClient.invalidateQueries({ queryKey: ["family", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["family-members"] });
    } catch {
      setJoinError("Network error. Please try again.");
    } finally {
      setJoinLoading(false);
    }
  }

  const joinCodeValue = joinWatch("code", "");

  return (
    <div className="p-4 lg:p-8 max-w-xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-5 h-5 text-brand-500" />
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Family Finance</h1>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Get started by creating a family group or joining one.
        </p>
      </div>

      {/* Create Option */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-5 space-y-4">
        <button
          onClick={() => setActiveOption(activeOption === "create" ? null : "create")}
          className="w-full flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center">
              <Home className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">Create a Family Group</p>
              <p className="text-xs text-slate-500">Set up a new group and invite members</p>
            </div>
          </div>
          <Plus className={cn("w-4 h-4 text-slate-400 transition-transform", activeOption === "create" && "rotate-45")} />
        </button>

        <AnimatePresence>
          {activeOption === "create" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <form onSubmit={handleCreateSubmit(onCreateFamily)} className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                <Input
                  label="Family Group Name"
                  placeholder="e.g. The Adeniyis"
                  error={createErrors.name?.message}
                  {...createRegister("name")}
                />
                <AppButton type="submit" variant="brand" fullWidth loading={createFamily.isPending}>
                  Create Family
                </AppButton>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Join Option */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-5 space-y-4">
        <button
          onClick={() => setActiveOption(activeOption === "join" ? null : "join")}
          className="w-full flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gold-100 dark:bg-gold-900/40 flex items-center justify-center">
              <LogIn className="w-4 h-4 text-gold-600 dark:text-gold-400" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">Join a Family Group</p>
              <p className="text-xs text-slate-500">Enter an invite code to join an existing group</p>
            </div>
          </div>
          <Plus className={cn("w-4 h-4 text-slate-400 transition-transform", activeOption === "join" && "rotate-45")} />
        </button>

        <AnimatePresence>
          {activeOption === "join" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                {joinError && (
                  <Alert variant="error" onDismiss={() => setJoinError(null)}>{joinError}</Alert>
                )}
                <form onSubmit={handleJoinSubmit(onJoinFamily)} className="space-y-3">
                  <Input
                    label="Invite Code"
                    placeholder="e.g. AB12CD34"
                    error={joinErrors.code?.message}
                    className="uppercase tracking-widest font-mono"
                    {...joinRegister("code")}
                    onChange={e => {
                      e.target.value = e.target.value.toUpperCase();
                      joinRegister("code").onChange(e);
                    }}
                  />
                  <AppButton
                    type="submit"
                    variant="gold"
                    fullWidth
                    loading={joinLoading}
                    disabled={joinCodeValue.length < 6}
                  >
                    Join Family
                  </AppButton>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── FamilyDashboard ──────────────────────────────────────────────────────────

function FamilyDashboard({ family }: { family: FamilyGroup }) {
  const [tab, setTab] = useState<"overview" | "members" | "finance" | "budget" | "invites">("overview");
  const { user }      = useAuth();

  const { data: members = [], isLoading: membersLoading } = useFamilyMembers(family.id);
  const { data: invites = [], isLoading: invitesLoading } = usePendingInvites(family.id);

  const { data: txData, isLoading: txLoading } = useQuery<{ transactions: EnrichedTransaction[] }>({
    queryKey:        ["family-transactions", family.id],
    enabled:         !!family.id,
    staleTime:       30_000,
    refetchInterval: 60_000,
    queryFn: async () => {
      const res = await fetch(`/api/family/transactions?familyId=${family.id}`);
      if (!res.ok) throw new Error("Failed to load family transactions");
      return res.json();
    },
  });
  const allTransactions = useMemo(
    () => (txData?.transactions ?? []) as EnrichedTransaction[],
    [txData]
  );

  const currentMonthTx = useMemo(() => {
    const now   = new Date();
    const start = format(startOfMonth(now), "yyyy-MM-dd");
    const end   = format(endOfMonth(now), "yyyy-MM-dd");
    return allTransactions.filter(t => t.date >= start && t.date <= end);
  }, [allTransactions]);

  const combinedIncome   = useMemo(() =>
    currentMonthTx.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0),
  [currentMonthTx]);

  const combinedExpenses = useMemo(() =>
    currentMonthTx.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0),
  [currentMonthTx]);

  const netBalance = combinedIncome - combinedExpenses;

  const currentMember = members.find(m => m.user_id === user?.id);
  const isAdmin       = currentMember?.role === "admin";

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-brand-500" />
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{family.name}</h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300">
              {members.length} member{members.length !== 1 ? "s" : ""}
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Family since {format(new Date(family.created_at), "MMM yyyy")}
          </p>
        </div>
        <AppButton onClick={() => useAppStore.getState().setAddTransactionOpen(true)} size="md">
          <Plus className="w-4 h-4" /> Add Transaction
        </AppButton>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap">
        {(["overview", "members", "finance", "budget", "invites"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize",
              tab === t
                ? "bg-brand-500 text-white"
                : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <OverviewTab
          combinedIncome={combinedIncome}
          combinedExpenses={combinedExpenses}
          netBalance={netBalance}
          currentMonthTx={currentMonthTx}
          isLoading={txLoading}
        />
      )}
      {tab === "members" && (
        <MembersTab
          members={members}
          familyId={family.id}
          currentUserId={user?.id}
          isAdmin={isAdmin}
          isLoading={membersLoading}
        />
      )}
      {tab === "finance" && (
        <FinanceTab
          transactions={allTransactions}
          members={members}
          isLoading={txLoading}
        />
      )}
      {tab === "budget" && (
        <BudgetTab
          allTransactions={allTransactions}
          members={members}
          isLoading={txLoading}
        />
      )}
      {tab === "invites" && (
        <InvitesTab
          familyId={family.id}
          invites={invites}
          isAdmin={isAdmin}
          isLoading={invitesLoading}
        />
      )}
    </div>
  );
}

// ─── OverviewTab ──────────────────────────────────────────────────────────────

function OverviewTab({
  combinedIncome, combinedExpenses, netBalance, currentMonthTx, isLoading,
}: {
  combinedIncome: number;
  combinedExpenses: number;
  netBalance: number;
  currentMonthTx: EnrichedTransaction[];
  isLoading: boolean;
}) {
  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-28 rounded-2xl skeleton" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KPICard
            label="Combined Income"
            value={combinedIncome}
            icon={<TrendingUp className="w-5 h-5 text-white/80" />}
            gradient="bg-gradient-success"
          />
          <KPICard
            label="Combined Expenses"
            value={combinedExpenses}
            icon={<TrendingDown className="w-5 h-5 text-white/80" />}
            gradient="bg-gradient-danger"
          />
          <KPICard
            label="Net Balance"
            value={Math.abs(netBalance)}
            icon={<Wallet className="w-5 h-5 text-white/80" />}
            gradient={netBalance >= 0 ? "bg-gradient-brand" : "bg-gradient-danger"}
            prefix={netBalance >= 0 ? "+" : "−"}
          />
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-5">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">
          Family Transactions This Month
        </h3>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-10 rounded-xl skeleton" />)}
          </div>
        ) : currentMonthTx.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">
            No family transactions this month yet.
          </p>
        ) : (
          <div className="space-y-1">
            {currentMonthTx.slice(0, 10).map(tx => {
              const meta       = getCategoryMeta(tx.category);
              const memberName = tx.member?.full_name ?? tx.member?.email ?? "Unknown";
              return (
                <div key={tx.id} className="flex items-center gap-3 py-2.5 border-b border-slate-100 dark:border-slate-700 last:border-0">
                  <span className="text-xl shrink-0">{meta.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{tx.description}</p>
                    <p className="text-xs text-slate-500">{meta.label} · {tx.date} · {memberName}</p>
                  </div>
                  <p className={cn(
                    "text-sm font-semibold tabular-nums shrink-0",
                    tx.type === "income" ? "text-emerald-500" : "text-red-400"
                  )}>
                    {tx.type === "income" ? "+" : "−"}{formatNaira(Number(tx.amount))}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MembersTab ───────────────────────────────────────────────────────────────

function MembersTab({ members, familyId, currentUserId, isAdmin, isLoading }: {
  members: FamilyMemberWithProfile[];
  familyId: string;
  currentUserId: string | undefined;
  isAdmin: boolean;
  isLoading: boolean;
}) {
  const [removeTarget, setRemoveTarget] = useState<FamilyMemberWithProfile | null>(null);
  const removeMember = useRemoveMember();

  function handleRemove() {
    if (!removeTarget) return;
    removeMember.mutate(
      { memberId: removeTarget.id, familyId },
      { onSuccess: () => setRemoveTarget(null) }
    );
  }

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map(i => <div key={i} className="h-28 rounded-2xl skeleton" />)}
        </div>
      ) : members.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-12">No members found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {members.map(member => {
            const name          = member.profile.full_name ?? member.profile.email ?? "Unknown";
            const isCurrentUser = member.user_id === currentUserId;
            return (
              <div
                key={member.id}
                className={cn(
                  "bg-white dark:bg-slate-800 rounded-2xl shadow-card p-4 space-y-3",
                  isCurrentUser && "ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-slate-900"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <MemberAvatar name={name} size="md" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                        {name}
                        {isCurrentUser && <span className="ml-1 text-xs text-brand-500">(you)</span>}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{member.profile.email}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0",
                    member.role === "admin"
                      ? "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  )}>
                    {member.role}
                  </span>
                </div>

                <p className="text-xs text-slate-500">
                  Joined {format(new Date(member.joined_at), "dd MMM yyyy")}
                </p>

                {isAdmin && !isCurrentUser && (
                  <button
                    onClick={() => setRemoveTarget(member)}
                    className="w-full text-xs text-red-400 hover:text-red-600 flex items-center justify-center gap-1 pt-2 border-t border-slate-100 dark:border-slate-700 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Remove Member
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <RemoveConfirmModal
        member={removeTarget}
        isPending={removeMember.isPending}
        onConfirm={handleRemove}
        onClose={() => setRemoveTarget(null)}
      />
    </div>
  );
}

// ─── FinanceTab ───────────────────────────────────────────────────────────────

function FinanceTab({ transactions, isLoading }: {
  transactions: EnrichedTransaction[];
  members: FamilyMemberWithProfile[];
  isLoading: boolean;
}) {
  const memberSpending = useMemo(() => {
    const map = new Map<string, { name: string; totalSpent: number }>();

    transactions
      .filter(t => t.type === "expense")
      .forEach(t => {
        const memberName = t.member?.full_name ?? t.member?.email ?? "Unknown";
        const uid        = t.user_id;
        if (map.has(uid)) {
          map.get(uid)!.totalSpent += Number(t.amount);
        } else {
          map.set(uid, { name: memberName, totalSpent: Number(t.amount) });
        }
      });

    const total = Array.from(map.values()).reduce((s, v) => s + v.totalSpent, 0);

    return Array.from(map.entries())
      .map(([userId, data]) => ({
        userId,
        name:       data.name,
        totalSpent: data.totalSpent,
        pct:        total > 0 ? (data.totalSpent / total) * 100 : 0,
        color:      colorFromString(data.name),
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent);
  }, [transactions]);

  const recentTransactions = useMemo(() => transactions.slice(0, 20), [transactions]);

  return (
    <div className="space-y-6">
      {/* Who Spent What */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-5">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">Who Spent What</h3>
        {isLoading ? (
          <div className="h-[260px] rounded-xl skeleton" />
        ) : memberSpending.length === 0 ? (
          <div className="flex items-center justify-center h-[260px] text-slate-400 text-sm">
            No expense data available yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={memberSpending}
                dataKey="totalSpent"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={50}
                paddingAngle={3}
              >
                {memberSpending.map(entry => (
                  <Cell key={entry.userId} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [formatNaira(Number(value ?? 0)), "Spent"]}
                {...TOOLTIP_STYLE}
              />
              <Legend
                formatter={(value) => (
                  <span style={{ color: "#94a3b8", fontSize: 12 }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Spending breakdown table */}
      {!isLoading && memberSpending.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-5">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">Spending Breakdown</h3>
          <div className="space-y-3">
            {memberSpending.map((m, idx) => (
              <div key={m.userId} className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 w-5 text-center">{idx + 1}</span>
                <MemberAvatar name={m.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{m.name}</p>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${m.pct}%`, backgroundColor: m.color }}
                    />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 tabular-nums">
                    {formatNaira(m.totalSpent)}
                  </p>
                  <p className="text-xs text-slate-500">{m.pct.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent transactions */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-5">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">Recent Family Transactions</h3>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-10 rounded-xl skeleton" />)}
          </div>
        ) : recentTransactions.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">
            No family transactions yet.
          </p>
        ) : (
          <div className="space-y-1">
            {recentTransactions.map(tx => {
              const meta       = getCategoryMeta(tx.category);
              const memberName = tx.member?.full_name ?? tx.member?.email ?? "Unknown";
              return (
                <div key={tx.id} className="flex items-center gap-3 py-2.5 border-b border-slate-100 dark:border-slate-700 last:border-0">
                  <MemberAvatar name={memberName} size="sm" />
                  <span className="text-xl shrink-0">{meta.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{tx.description}</p>
                    <p className="text-xs text-slate-500">{memberName} · {meta.label} · {tx.date}</p>
                  </div>
                  <p className={cn(
                    "text-sm font-semibold tabular-nums shrink-0",
                    tx.type === "income" ? "text-emerald-500" : "text-red-400"
                  )}>
                    {tx.type === "income" ? "+" : "−"}{formatNaira(Number(tx.amount))}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── BudgetTab ────────────────────────────────────────────────────────────────

function BudgetTab({
  allTransactions,
  members,
  isLoading: txLoading,
}: {
  allTransactions: EnrichedTransaction[];
  members: FamilyMemberWithProfile[];
  isLoading: boolean;
}) {
  // Suppress unused type warnings — BudgetFull/GoalFull used via hook return types
  void (null as unknown as BudgetFull);
  void (null as unknown as GoalFull);

  const { data: budgets = [], isLoading: budgetsLoading } = useBudgets();
  const { data: goals   = [], isLoading: goalsLoading   } = useGoals();
  const isLoading = txLoading || budgetsLoading || goalsLoading;

  const now   = new Date();
  const start = format(startOfMonth(now), "yyyy-MM-dd");
  const end   = format(endOfMonth(now), "yyyy-MM-dd");

  const familySpentByCategory = useMemo(() => {
    const map = new Map<string, number>();
    allTransactions
      .filter(t => t.type === "expense" && t.date >= start && t.date <= end)
      .forEach(t => { map.set(t.category, (map.get(t.category) ?? 0) + Number(t.amount)); });
    return map;
  }, [allTransactions, start, end]);

  const memberSpendByCategory = useMemo(() => {
    const map = new Map<string, Map<string, number>>();
    allTransactions
      .filter(t => t.type === "expense" && t.date >= start && t.date <= end)
      .forEach(t => {
        if (!map.has(t.category)) map.set(t.category, new Map());
        const inner = map.get(t.category)!;
        inner.set(t.user_id, (inner.get(t.user_id) ?? 0) + Number(t.amount));
      });
    return map;
  }, [allTransactions, start, end]);

  const activeGoals = useMemo(() => goals.filter(g => !g.is_completed), [goals]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-2xl skeleton" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Family Budgets ── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-brand-500" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Family Budgets This Month</h3>
        </div>

        {budgets.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">
            No budgets set.{" "}
            <a href="/budgets" className="text-brand-500 hover:underline">Create budgets</a> to track family spending.
          </p>
        ) : (
          <div className="space-y-4">
            {budgets.map(b => {
              const familySpent = familySpentByCategory.get(b.category) ?? 0;
              const pct         = clampPercent((familySpent / b.amount) * 100);
              const isOver      = familySpent > b.amount;
              const isWarn      = !isOver && pct >= b.alert_threshold;
              const barColor    = isOver ? "bg-red-500" : isWarn ? "bg-gold-500" : "bg-brand-500";
              const meta        = getCategoryMeta(b.category);
              const memberSpend = memberSpendByCategory.get(b.category);

              return (
                <div key={b.id} className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{meta.emoji}</span>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{meta.label}</span>
                      {isOver && <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                    </div>
                    <div className="text-right">
                      <span className={cn("text-sm font-semibold tabular-nums", isOver ? "text-red-500" : "text-slate-800 dark:text-slate-100")}>
                        {formatNaira(familySpent, { compact: true })}
                      </span>
                      <span className="text-xs text-slate-400"> / {formatNaira(b.amount, { compact: true })}</span>
                    </div>
                  </div>

                  <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      className={cn("h-full rounded-full", barColor)}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>

                  {memberSpend && memberSpend.size > 0 && (
                    <div className="flex flex-wrap gap-2 pt-0.5">
                      {[...memberSpend.entries()].map(([uid, spent]) => {
                        const m    = members.find(x => x.user_id === uid);
                        const name = m?.profile.full_name ?? m?.profile.email ?? uid;
                        return (
                          <div key={uid} className="flex items-center gap-1.5 text-xs text-slate-500">
                            <MemberAvatar name={name} size="sm" />
                            <span>{formatNaira(spent, { compact: true })}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Savings Goals ── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PiggyBank className="w-4 h-4 text-brand-500" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Savings Goals</h3>
          </div>
          <a href="/savings" className="text-xs text-brand-500 hover:underline">Manage →</a>
        </div>

        {activeGoals.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">
            No active goals.{" "}
            <a href="/savings" className="text-brand-500 hover:underline">Create one</a>
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-700/40 p-3 text-center">
                <p className="text-xs text-slate-500">Total Saved</p>
                <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                  {formatNaira(activeGoals.reduce((s, g) => s + g.current_amount, 0), { compact: true })}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-700/40 p-3 text-center">
                <p className="text-xs text-slate-500">Total Target</p>
                <p className="text-base font-bold text-slate-800 dark:text-slate-100">
                  {formatNaira(activeGoals.reduce((s, g) => s + g.target_amount, 0), { compact: true })}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {activeGoals.map(g => {
                const color = g.color ?? "#1a4ff5";
                return (
                  <div key={g.id} className="flex items-center gap-3 py-2.5 border-b border-slate-100 dark:border-slate-700 last:border-0">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                      style={{ backgroundColor: `${color}1a` }}
                    >
                      {g.icon ?? "🎯"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{g.name}</p>
                      <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${clampPercent(g.percentage)}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 tabular-nums">
                        {formatNaira(g.current_amount, { compact: true })}
                      </p>
                      <p className="text-xs text-slate-500">{g.percentage.toFixed(0)}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── InvitesTab ───────────────────────────────────────────────────────────────

function expiryLabel(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 24) return `Expires in ${hours}h`;
  const days = Math.floor(diff / 86_400_000);
  return `Expires in ${days}d`;
}

function InvitesTab({ familyId, invites, isAdmin, isLoading }: {
  familyId: string;
  invites: FamilyInvite[];
  isAdmin: boolean;
  isLoading: boolean;
}) {
  const [copiedId, setCopiedId]   = useState<string | null>(null);
  const [joinCode, setJoinCode]   = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinLoading, setJoinLoading] = useState(false);

  const generateInvite = useGenerateInvite();
  const { user }       = useAuth();
  const queryClient    = useQueryClient();

  function handleCopy(code: string, inviteId: string) {
    try {
      navigator.clipboard.writeText(code).then(() => {
        toast.success("Invite code copied!");
        setCopiedId(inviteId);
        setTimeout(() => setCopiedId(null), 2000);
      });
    } catch {
      toast.error("Copy not supported in this browser");
    }
  }

  async function handleJoin() {
    if (joinCode.trim().length < 6) return;
    setJoinLoading(true);
    setJoinError(null);
    try {
      const res = await fetch("/api/family/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: joinCode.trim().toUpperCase() }),
      });
      const json = await res.json();
      if (!res.ok) {
        setJoinError(json.error ?? "Failed to join family");
        return;
      }
      toast.success("Joined family successfully!");
      queryClient.invalidateQueries({ queryKey: ["family", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["family-members"] });
      setJoinCode("");
    } catch {
      setJoinError("Network error. Please try again.");
    } finally {
      setJoinLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Generate Invite (admin only) */}
      {isAdmin && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Invite New Members</h3>
            <AppButton
              size="sm"
              variant="brand"
              loading={generateInvite.isPending}
              onClick={() => generateInvite.mutate(familyId)}
            >
              <Plus className="w-3.5 h-3.5" /> Generate Code
            </AppButton>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2].map(i => <div key={i} className="h-12 rounded-xl skeleton" />)}
            </div>
          ) : invites.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">
              No active invite codes. Generate one above.
            </p>
          ) : (
            <div className="space-y-2">
              {invites.map(invite => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm font-bold text-slate-800 dark:text-slate-100 tracking-widest">
                      {invite.invite_code}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{expiryLabel(invite.expires_at)}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(invite.invite_code, invite.id)}
                    className="shrink-0 p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 transition-colors"
                    title="Copy code"
                  >
                    {copiedId === invite.id
                      ? <Check className="w-4 h-4 text-emerald-500" />
                      : <Copy className="w-4 h-4" />
                    }
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Join Another Family */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Join Another Family</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Enter an invite code to join a different family group.
        </p>
        {joinError && (
          <Alert variant="error" onDismiss={() => setJoinError(null)}>{joinError}</Alert>
        )}
        <div className="flex gap-2">
          <Input
            placeholder="e.g. AB12CD34"
            value={joinCode}
            onChange={e => setJoinCode(e.target.value.toUpperCase())}
            className="font-mono tracking-widest uppercase flex-1"
          />
          <AppButton
            size="md"
            variant="outline"
            loading={joinLoading}
            disabled={joinCode.trim().length < 6}
            onClick={handleJoin}
          >
            Join
          </AppButton>
        </div>
      </div>
    </div>
  );
}
