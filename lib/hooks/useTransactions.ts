"use client";

import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import type { Transaction, TransactionInsert } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TransactionFilters {
  type:          "all" | "income" | "expense";
  categories:    string[];
  paymentMethod: string | null;
  search:        string;
  dateRange:     "today" | "week" | "month" | "all" | "custom";
  startDate:     string;
  endDate:       string;
}

export const DEFAULT_FILTERS: TransactionFilters = {
  type:          "all",
  categories:    [],
  paymentMethod: null,
  search:        "",
  dateRange:     "month",
  startDate:     "",
  endDate:       "",
};

const PAGE_SIZE = 50;

// ─── Date range helper ────────────────────────────────────────────────────────

function resolveDateRange(f: TransactionFilters): { start: string; end: string } | null {
  const fmt  = (d: Date) => d.toISOString().split("T")[0];
  const today = new Date();

  switch (f.dateRange) {
    case "today":
      return { start: fmt(today), end: fmt(today) };
    case "week": {
      const s = new Date(today);
      s.setDate(today.getDate() - 6);
      return { start: fmt(s), end: fmt(today) };
    }
    case "month": {
      const s = new Date(today.getFullYear(), today.getMonth(), 1);
      return { start: fmt(s), end: fmt(today) };
    }
    case "custom":
      return f.startDate && f.endDate
        ? { start: f.startDate, end: f.endDate }
        : null;
    default:
      return null;
  }
}

// ─── Query builder ────────────────────────────────────────────────────────────

function applyFilters(
  query: ReturnType<ReturnType<typeof createClient>["from"]>,
  userId: string,
  filters: TransactionFilters
) {
  const q = (query as ReturnType<ReturnType<typeof createClient>["from"]> & {
    eq: (...a: unknown[]) => unknown;
  })
    // We'll cast properly below — just use the fluent API
    ;

  // Start fresh with typed query
  const supabase = createClient();
  let q2 = supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId);

  if (filters.type !== "all") {
    q2 = q2.eq("type", filters.type) as typeof q2;
  }

  if (filters.categories.length > 0) {
    q2 = q2.in("category", filters.categories) as typeof q2;
  }

  if (filters.search.trim()) {
    q2 = q2.ilike("description", `%${filters.search.trim()}%`) as typeof q2;
  }

  if (filters.paymentMethod) {
    q2 = q2.contains("tags", [filters.paymentMethod]) as typeof q2;
  }

  const range = resolveDateRange(filters);
  if (range) {
    q2 = q2.gte("date", range.start).lte("date", range.end) as typeof q2;
  }

  return q2;
}

// ─── useTransactions ─────────────────────────────────────────────────────────

export function useTransactions(filters: TransactionFilters = DEFAULT_FILTERS) {
  const { user } = useAuth();
  const uid = user?.id;

  return useInfiniteQuery({
    queryKey:        ["transactions", uid, filters],
    enabled:         !!uid,
    initialPageParam: 0 as number,
    queryFn: async ({ pageParam }) => {
      const supabase = createClient();
      let q = supabase
        .from("transactions")
        .select("*")
        .eq("user_id", uid!);

      if (filters.type !== "all")          q = q.eq("type", filters.type) as typeof q;
      if (filters.categories.length > 0)   q = q.in("category", filters.categories) as typeof q;
      if (filters.search.trim())            q = q.ilike("description", `%${filters.search.trim()}%`) as typeof q;
      if (filters.paymentMethod)           q = q.contains("tags", [filters.paymentMethod]) as typeof q;

      const range = resolveDateRange(filters);
      if (range) q = q.gte("date", range.start).lte("date", range.end) as typeof q;

      const from = pageParam * PAGE_SIZE;
      const { data, error } = await q
        .order("date", { ascending: false })
        .order("created_at", { ascending: false })
        .range(from, from + PAGE_SIZE - 1);

      if (error) throw error;
      return (data ?? []) as Transaction[];
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < PAGE_SIZE ? undefined : allPages.length,
  });
}

// ─── useTransactionStats ─────────────────────────────────────────────────────

export function useTransactionStats(filters: TransactionFilters = DEFAULT_FILTERS) {
  const { user } = useAuth();
  const uid = user?.id;

  return useQuery({
    queryKey:  ["transaction-stats", uid, filters],
    enabled:   !!uid,
    staleTime: 30_000,
    queryFn: async () => {
      const supabase = createClient();
      let q = supabase
        .from("transactions")
        .select("type, amount")
        .eq("user_id", uid!);

      if (filters.type !== "all")          q = q.eq("type", filters.type) as typeof q;
      if (filters.categories.length > 0)   q = q.in("category", filters.categories) as typeof q;
      if (filters.search.trim())            q = q.ilike("description", `%${filters.search.trim()}%`) as typeof q;
      if (filters.paymentMethod)           q = q.contains("tags", [filters.paymentMethod]) as typeof q;

      const range = resolveDateRange(filters);
      if (range) q = q.gte("date", range.start).lte("date", range.end) as typeof q;

      const { data, error } = await q;
      if (error) throw error;

      const rows = (data ?? []) as { type: string; amount: number }[];
      const totalIncome   = rows.filter((r) => r.type === "income").reduce((s, r) => s + Number(r.amount), 0);
      const totalExpenses = rows.filter((r) => r.type === "expense").reduce((s, r) => s + Number(r.amount), 0);

      return {
        totalIncome,
        totalExpenses,
        netBalance: totalIncome - totalExpenses,
        count:      rows.length,
      };
    },
  });
}

// ─── useDeleteTransaction ─────────────────────────────────────────────────────

export function useDeleteTransaction() {
  const { user } = useAuth();
  const qc       = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["transaction-stats"] });
      qc.invalidateQueries({ queryKey: ["dashboard-transactions"] });
      qc.invalidateQueries({ queryKey: ["budgets"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Transaction deleted");
    },
    onError: (err: Error) => {
      toast.error("Failed to delete", { description: err.message });
    },
  });
}

// ─── useUpdateTransaction ─────────────────────────────────────────────────────

export function useUpdateTransaction() {
  const { user } = useAuth();
  const qc       = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Omit<TransactionInsert, "user_id">>;
    }) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("transactions")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["transaction-stats"] });
      qc.invalidateQueries({ queryKey: ["dashboard-transactions"] });
      qc.invalidateQueries({ queryKey: ["budgets"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Transaction updated");
    },
    onError: (err: Error) => {
      toast.error("Failed to update", { description: err.message });
    },
  });
}

// ─── useExportTransactions ────────────────────────────────────────────────────
// Fetches ALL matching transactions (no pagination) for CSV export

export function useExportTransactions() {
  const { user } = useAuth();

  return async (filters: TransactionFilters): Promise<Transaction[]> => {
    const supabase = createClient();
    let q = supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user!.id);

    if (filters.type !== "all")          q = q.eq("type", filters.type) as typeof q;
    if (filters.categories.length > 0)   q = q.in("category", filters.categories) as typeof q;
    if (filters.search.trim())            q = q.ilike("description", `%${filters.search.trim()}%`) as typeof q;
    if (filters.paymentMethod)           q = q.contains("tags", [filters.paymentMethod]) as typeof q;

    const range = resolveDateRange(filters);
    if (range) q = q.gte("date", range.start).lte("date", range.end) as typeof q;

    const { data, error } = await q
      .order("date", { ascending: false })
      .limit(10_000);

    if (error) throw error;
    return (data ?? []) as Transaction[];
  };
}
