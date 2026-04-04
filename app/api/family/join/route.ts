import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { code } = body as { code?: string };

  if (!code) {
    return NextResponse.json({ error: "code required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Look up the invite
  const { data: invite, error: inviteErr } = await supabase
    .from("family_invites")
    .select("*")
    .eq("invite_code", code.toUpperCase())
    .maybeSingle();

  if (inviteErr || !invite) {
    return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
  }

  if (invite.accepted) {
    return NextResponse.json({ error: "Invite already used" }, { status: 409 });
  }

  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: "Invite has expired" }, { status: 410 });
  }

  // Check if already a member
  const { data: existing } = await supabase
    .from("family_members")
    .select("id")
    .eq("family_id", invite.family_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ message: "Already a member", familyId: invite.family_id });
  }

  // Add as member
  const { error: memberErr } = await supabase
    .from("family_members")
    .insert({ family_id: invite.family_id, user_id: user.id, role: "member" });

  if (memberErr) {
    return NextResponse.json({ error: memberErr.message }, { status: 500 });
  }

  // Mark invite accepted
  await supabase
    .from("family_invites")
    .update({ accepted: true, accepted_by: user.id })
    .eq("id", invite.id);

  return NextResponse.json({ message: "Joined successfully", familyId: invite.family_id });
}
