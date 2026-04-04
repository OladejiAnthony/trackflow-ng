"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import { percentage } from "@/lib/utils";
import type { Goal, GoalInsert } from "@/types";
import { differenceInCalendarDays } from "date-fns";

export type GoalFull = Goal & {
  remaining: number;
  percentage: number;
  daysLeft: number;
};

// ─── useGoals ─────────────────────────────────────────────────────────────────

export function useGoals() {
  const { user } = useAuth();

  return useQuery({
    queryKey:        ["goals", user?.id],
    enabled:         !!user?.id,
    staleTime:       30_000,
    refetchInterval: 30_000,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const today = new Date();
      return (data ?? []).map(g => ({
        ...g,
        remaining:  g.target_amount - g.current_amount,
        percentage: percentage(g.current_amount, g.target_amount),
        daysLeft:   Math.max(0, differenceInCalendarDays(new Date(g.target_date), today)),
      })) as GoalFull[];
    },
  });
}

// ─── useAddGoal ───────────────────────────────────────────────────────────────

export function useAddGoal() {
  const { user } = useAuth();
  const qc       = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<GoalInsert, "user_id">) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("goals")
        .insert({ ...data, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      qc.invalidateQueries({ queryKey: ["dashboard-goals"] });
      toast.success("Goal created");
    },
    onError: (err: Error) => {
      toast.error("Failed to create goal", { description: err.message });
    },
  });
}

// ─── useUpdateGoal ────────────────────────────────────────────────────────────

export function useUpdateGoal() {
  const { user } = useAuth();
  const qc       = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Omit<GoalInsert, "user_id">>;
    }) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("goals")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      qc.invalidateQueries({ queryKey: ["dashboard-goals"] });
      toast.success("Goal updated");
    },
    onError: (err: Error) => {
      toast.error("Failed to update goal", { description: err.message });
    },
  });
}

// ─── useDeleteGoal ────────────────────────────────────────────────────────────

export function useDeleteGoal() {
  const { user } = useAuth();
  const qc       = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("goals")
        .delete()
        .eq("id", id)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      qc.invalidateQueries({ queryKey: ["dashboard-goals"] });
      toast.success("Goal deleted");
    },
    onError: (err: Error) => {
      toast.error("Failed to delete goal", { description: err.message });
    },
  });
}

// ─── useAddMoneyToGoal ────────────────────────────────────────────────────────

export function useAddMoneyToGoal() {
  const { user } = useAuth();
  const qc       = useQueryClient();

  return useMutation({
    mutationFn: async ({
      goalId,
      goalName,
      amount,
      currentAmount,
      targetAmount,
    }: {
      goalId: string;
      goalName: string;
      amount: number;
      currentAmount: number;
      targetAmount: number;
    }) => {
      const supabase  = createClient();
      const newAmount = currentAmount + amount;
      const isNowComplete = newAmount >= targetAmount;

      const [goalResult, txResult] = await Promise.all([
        supabase
          .from("goals")
          .update({
            current_amount: newAmount,
            is_completed:   isNowComplete,
            updated_at:     new Date().toISOString(),
          })
          .eq("id", goalId)
          .eq("user_id", user!.id),
        supabase.from("transactions").insert({
          user_id:     user!.id,
          type:        "expense",
          category:    "savings",
          description: `Savings: ${goalName}`,
          amount,
          date:        new Date().toISOString().split("T")[0],
        }),
      ]);

      if (goalResult.error) throw goalResult.error;
      if (txResult.error)   throw txResult.error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      qc.invalidateQueries({ queryKey: ["dashboard-goals"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["dashboard-transactions"] });
      toast.success("Money added to goal");
    },
    onError: (err: Error) => {
      toast.error("Failed to add money", { description: err.message });
    },
  });
}
