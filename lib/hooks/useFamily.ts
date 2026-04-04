"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import type {
  FamilyGroup,
  FamilyMember,
  FamilyInvite,
  Profile,
} from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export type FamilyMemberWithProfile = FamilyMember & {
  profile: Pick<Profile, "id" | "full_name" | "avatar_url" | "email">;
};

// ─── useMyFamily ─────────────────────────────────────────────────────────────

export function useMyFamily() {
  const { user } = useAuth();

  return useQuery<FamilyGroup | null>({
    queryKey:        ["family", user?.id],
    enabled:         !!user?.id,
    refetchInterval: 30_000,
    queryFn: async () => {
      const supabase = createClient();
      // Find the family_group where the current user is a member
      const { data: membership } = await supabase
        .from("family_members")
        .select("family_id")
        .eq("user_id", user!.id)
        .limit(1)
        .maybeSingle();

      if (!membership) return null;

      const { data: group, error } = await supabase
        .from("family_groups")
        .select("*")
        .eq("id", membership.family_id)
        .maybeSingle();

      if (error) throw error;
      return (group as FamilyGroup) ?? null;
    },
  });
}

// ─── useFamilyMembers ─────────────────────────────────────────────────────────

export function useFamilyMembers(familyId: string | null) {
  return useQuery<FamilyMemberWithProfile[]>({
    queryKey:        ["family-members", familyId],
    enabled:         !!familyId,
    refetchInterval: 30_000,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("family_members")
        .select("*")
        .eq("family_id", familyId!);

      if (error) throw error;
      const members = (data ?? []) as FamilyMember[];

      // Fetch profiles for each member
      const userIds = members.map((m) => m.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, email")
        .in("id", userIds);

      const profileMap = new Map(
        (profiles ?? []).map((p) => [p.id, p])
      );

      return members.map((m) => ({
        ...m,
        profile: profileMap.get(m.user_id) ?? {
          id: m.user_id,
          full_name: null,
          avatar_url: null,
          email: "",
        },
      })) as FamilyMemberWithProfile[];
    },
  });
}

// ─── usePendingInvites ────────────────────────────────────────────────────────

export function usePendingInvites(familyId: string | null) {
  return useQuery<FamilyInvite[]>({
    queryKey:        ["family-invites", familyId],
    enabled:         !!familyId,
    refetchInterval: 30_000,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("family_invites")
        .select("*")
        .eq("family_id", familyId!)
        .eq("accepted", false)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as FamilyInvite[];
    },
  });
}

// ─── useCreateFamily ──────────────────────────────────────────────────────────

export function useCreateFamily() {
  const { user } = useAuth();
  const qc       = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const supabase   = createClient();
      const inviteCode = generateCode(8);

      const { data: group, error: groupErr } = await supabase
        .from("family_groups")
        .insert({ name, created_by: user!.id, invite_code: inviteCode })
        .select()
        .single();

      if (groupErr) throw groupErr;

      const { error: memberErr } = await supabase
        .from("family_members")
        .insert({ family_id: group.id, user_id: user!.id, role: "admin" });

      if (memberErr) throw memberErr;
      return group as FamilyGroup;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["family"] });
      qc.invalidateQueries({ queryKey: ["family-members"] });
      toast.success("Family group created!");
    },
    onError: (err: Error) => {
      toast.error("Failed to create family group", { description: err.message });
    },
  });
}

// ─── useGenerateInvite ────────────────────────────────────────────────────────

export function useGenerateInvite() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (familyId: string) => {
      const supabase   = createClient();
      const inviteCode = generateCode(8);
      const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from("family_invites")
        .insert({ family_id: familyId, invite_code: inviteCode, expires_at })
        .select()
        .single();

      if (error) throw error;
      return data as FamilyInvite;
    },
    onSuccess: (_, familyId) => {
      qc.invalidateQueries({ queryKey: ["family-invites", familyId] });
    },
    onError: (err: Error) => {
      toast.error("Failed to generate invite", { description: err.message });
    },
  });
}

// ─── useRemoveMember ─────────────────────────────────────────────────────────

export function useRemoveMember() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, familyId }: { memberId: string; familyId: string }) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("family_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;
      return familyId;
    },
    onSuccess: (familyId) => {
      qc.invalidateQueries({ queryKey: ["family-members", familyId] });
      toast.success("Member removed");
    },
    onError: (err: Error) => {
      toast.error("Failed to remove member", { description: err.message });
    },
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateCode(length: number): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result  = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
