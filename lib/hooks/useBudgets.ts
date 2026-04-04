"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import { percentage } from "@/lib/utils";
import type { Budget, BudgetInsert } from "@/types";

export type BudgetFull = Budget & {
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
};

// ─── useBudgets ───────────────────────────────────────────────────────────────

export function useBudgets() {
  const { user } = useAuth();

  return useQuery({
    queryKey:        ["budgets", user?.id],
    enabled:         !!user?.id,
    staleTime:       30_000,
    refetchInterval: 30_000,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", user!.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(b => ({
        ...b,
        remaining:    b.amount - b.spent,
        percentage:   percentage(b.spent, b.amount),
        isOverBudget: b.spent > b.amount,
      })) as BudgetFull[];
    },
  });
}

// ─── useAddBudget ─────────────────────────────────────────────────────────────

export function useAddBudget() {
  const { user } = useAuth();
  const qc       = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<BudgetInsert, "user_id">) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("budgets")
        .insert({ ...data, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budgets"] });
      qc.invalidateQueries({ queryKey: ["dashboard-budgets"] });
      toast.success("Budget created");
    },
    onError: (err: Error) => {
      toast.error("Failed to create budget", { description: err.message });
    },
  });
}

// ─── useUpdateBudget ──────────────────────────────────────────────────────────

export function useUpdateBudget() {
  const { user } = useAuth();
  const qc       = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Omit<BudgetInsert, "user_id">>;
    }) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("budgets")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budgets"] });
      qc.invalidateQueries({ queryKey: ["dashboard-budgets"] });
      toast.success("Budget updated");
    },
    onError: (err: Error) => {
      toast.error("Failed to update budget", { description: err.message });
    },
  });
}

// ─── useDeleteBudget ──────────────────────────────────────────────────────────

export function useDeleteBudget() {
  const { user } = useAuth();
  const qc       = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("budgets")
        .delete()
        .eq("id", id)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budgets"] });
      qc.invalidateQueries({ queryKey: ["dashboard-budgets"] });
      toast.success("Budget deleted");
    },
    onError: (err: Error) => {
      toast.error("Failed to delete budget", { description: err.message });
    },
  });
}
