import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendFamilyInviteEmail } from "@/lib/notifications/email";

function generateCode(length = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { email, familyId } = body as { email?: string; familyId?: string };

  if (!email || !familyId) {
    return NextResponse.json({ error: "email and familyId are required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify caller is admin of this family
  const { data: membership } = await supabase
    .from("family_members")
    .select("role")
    .eq("family_id", familyId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership || membership.role !== "admin") {
    return NextResponse.json({ error: "Only family admins can send invites" }, { status: 403 });
  }

  // Fetch family name
  const { data: family } = await supabase
    .from("family_groups")
    .select("name")
    .eq("id", familyId)
    .single();

  const inviteCode = generateCode();
  const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: invite, error: insertErr } = await supabase
    .from("family_invites")
    .insert({ family_id: familyId, invite_code: inviteCode, expires_at, email })
    .select()
    .single();

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  try {
    await sendFamilyInviteEmail({
      toEmail: email,
      inviteCode,
      familyName: family?.name ?? "your family",
    });
  } catch (err: unknown) {
    // Code was saved — return 207 so the client can show the code manually
    const emailError = err instanceof Error ? err.message : "Email delivery failed";
    return NextResponse.json({ invite, emailError }, { status: 207 });
  }

  return NextResponse.json({ invite });
}
