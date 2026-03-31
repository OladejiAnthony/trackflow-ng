import { createClient } from "@/lib/supabase/client";
import type {
  AuthChangeEvent,
  Session,
  UserMetadata,
} from "@supabase/supabase-js";

// ─── Sign Up ──────────────────────────────────────────────────────────────────

export async function signUp(
  email: string,
  password: string,
  metadata?: UserMetadata
) {
  const supabase = createClient();
  return supabase.auth.signUp({
    email,
    password,
    options: { data: metadata },
  });
}

// ─── Sign In ──────────────────────────────────────────────────────────────────

export async function signIn(email: string, password: string) {
  const supabase = createClient();
  return supabase.auth.signInWithPassword({ email, password });
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────

export async function signOut() {
  const supabase = createClient();
  return supabase.auth.signOut();
}

// ─── Reset Password (sends email) ────────────────────────────────────────────

export async function resetPassword(email: string, redirectTo: string) {
  const supabase = createClient();
  return supabase.auth.resetPasswordForEmail(email, { redirectTo });
}

// ─── Update Password (requires active session) ───────────────────────────────

export async function updatePassword(newPassword: string) {
  const supabase = createClient();
  return supabase.auth.updateUser({ password: newPassword });
}

// ─── Get Session ─────────────────────────────────────────────────────────────

export async function getSession() {
  const supabase = createClient();
  return supabase.auth.getSession();
}

// ─── Auth State Change ────────────────────────────────────────────────────────
// Caller is responsible for calling subscription.unsubscribe() on cleanup.

export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void
) {
  const supabase = createClient();
  return supabase.auth.onAuthStateChange(callback);
}
