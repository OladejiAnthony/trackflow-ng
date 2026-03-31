import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPushNotification, PushPayload } from "@/lib/notifications/push";
import type { PushSubscription } from "web-push";

export async function POST(req: NextRequest) {
  try {
    // Verify the caller is an authenticated user (or an internal cron with service key)
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json() as { payload: PushPayload };
    if (!body?.payload?.title || !body?.payload?.body) {
      return NextResponse.json({ error: "Missing payload.title or payload.body" }, { status: 400 });
    }

    // Fetch the user's push subscription
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("push_subscription")
      .eq("id", user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    if (!profile?.push_subscription) {
      return NextResponse.json({ error: "No push subscription found" }, { status: 404 });
    }

    const sub = profile.push_subscription as unknown as PushSubscription;
    const sent = await sendPushNotification(sub, body.payload);

    if (!sent) {
      // Subscription expired — clear it from the profile
      await supabase
        .from("profiles")
        .update({ push_subscription: null })
        .eq("id", user.id);
      return NextResponse.json({ error: "Subscription expired" }, { status: 410 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
