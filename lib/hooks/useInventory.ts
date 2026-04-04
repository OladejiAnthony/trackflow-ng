"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import type { InventoryItem, InventoryItemInsert } from "@/types";

// ─── useInventory ─────────────────────────────────────────────────────────────

export function useInventory() {
  const { user } = useAuth();

  return useQuery<InventoryItem[]>({
    queryKey:        ["inventory", user?.id],
    enabled:         !!user?.id,
    refetchInterval: 30_000,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("inventory_items")
        .select("*")
        .eq("user_id", user!.id)
        .order("name", { ascending: true });

      if (error) throw error;
      return (data ?? []) as InventoryItem[];
    },
  });
}

// ─── useAddInventoryItem ──────────────────────────────────────────────────────

export function useAddInventoryItem() {
  const { user } = useAuth();
  const qc       = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<InventoryItemInsert, "user_id">) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("inventory_items")
        .insert({ ...data, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Item added");
    },
    onError: (err: Error) => {
      toast.error("Failed to add item", { description: err.message });
    },
  });
}

// ─── useUpdateInventoryItem ───────────────────────────────────────────────────

export function useUpdateInventoryItem() {
  const { user } = useAuth();
  const qc       = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Omit<InventoryItemInsert, "user_id">>;
    }) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("inventory_items")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Item updated");
    },
    onError: (err: Error) => {
      toast.error("Failed to update item", { description: err.message });
    },
  });
}

// ─── useDeleteInventoryItem ───────────────────────────────────────────────────

export function useDeleteInventoryItem() {
  const { user } = useAuth();
  const qc       = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("inventory_items")
        .delete()
        .eq("id", id)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Item deleted");
    },
    onError: (err: Error) => {
      toast.error("Failed to delete item", { description: err.message });
    },
  });
}
