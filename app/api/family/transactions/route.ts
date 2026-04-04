import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const familyId         = searchParams.get("familyId");

  if (!familyId) {
    return NextResponse.json({ error: "familyId required" }, { status: 400 });
  }

  // Verify the requesting user is a member of this family
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: membership } = await supabase
    .from("family_members")
    .select("id")
    .eq("family_id", familyId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json({ error: "Not a family member" }, { status: 403 });
  }

  // Use admin client to read all family members' transactions
  const admin = await createAdminClient();

  const { data: members } = await admin
    .from("family_members")
    .select("user_id")
    .eq("family_id", familyId);

  const memberIds = (members ?? []).map((m: { user_id: string }) => m.user_id);

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, full_name, avatar_url, email")
    .in("id", memberIds);

  const profileMap = new Map(
    (profiles ?? []).map((p: { id: string; full_name: string | null; avatar_url: string | null; email: string }) => [p.id, p])
  );

  const { data: transactions, error } = await admin
    .from("transactions")
    .select("*")
    .in("user_id", memberIds)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const enriched = (transactions ?? []).map((tx: Record<string, unknown>) => ({
    ...tx,
    member: profileMap.get(tx.user_id as string) ?? null,
  }));

  return NextResponse.json({ transactions: enriched });
}
