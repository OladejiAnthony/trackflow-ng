"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

// ─── Error mapping ────────────────────────────────────────────────────────────

function mapAuthError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("rate limit") || m.includes("email rate") || m.includes("over_email_send_rate_limit"))
    return "Too many attempts — please wait a few minutes, then try again.";
  if (m.includes("already registered") || m.includes("user already exists") || m.includes("email already"))
    return "An account with this email already exists. Try signing in instead.";
  if (m.includes("invalid email") || m.includes("email address"))
    return "Please enter a valid email address.";
  if (m.includes("weak password") || m.includes("password should"))
    return "Password is too weak. Please choose a stronger password.";
  if (m.includes("network") || m.includes("fetch"))
    return "Network error — check your connection and try again.";
  return msg;
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function loginWithEmail(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = (formData.get("redirect") as string) ?? "/dashboard";

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: mapAuthError(error.message) };
  }

  redirect(redirectTo);
}

// ─── Register ─────────────────────────────────────────────────────────────────

export async function registerWithEmail(formData: FormData) {
  const email         = formData.get("email")          as string;
  const password      = formData.get("password")       as string;
  const full_name     = formData.get("full_name")      as string;
  const phone         = formData.get("phone")          as string;
  const account_type  = formData.get("account_type")  as string;
  const business_name = formData.get("business_name") as string | null;

  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name, phone, account_type, business_name: business_name || null },
      emailRedirectTo: `${origin}/api/auth/callback?next=/onboarding/welcome`,
    },
  });

  if (error) return { error: mapAuthError(error.message) };
  return { success: true };
}

export async function resendVerificationEmail(email: string) {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: `${origin}/api/auth/callback?next=/onboarding/welcome` },
  });

  if (error) return { error: mapAuthError(error.message) };
  return { success: true };
}

export async function checkEmailAvailable(email: string) {
  const supabase = await createAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  return { available: !data };
}

// ─── Google OAuth ─────────────────────────────────────────────────────────────

export async function loginWithGoogle(next = "/dashboard") {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/api/auth/callback?next=${encodeURIComponent(next)}`,
      queryParams: { access_type: "offline", prompt: "consent" },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
}

// ─── Forgot Password ──────────────────────────────────────────────────────────

export async function forgotPassword(formData: FormData) {
  const email = formData.get("email") as string;
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/api/auth/callback?next=/reset-password`,
  });

  if (error) {
    return { error: mapAuthError(error.message) };
  }

  return { success: true };
}

// ─── Reset Password ───────────────────────────────────────────────────────────

export async function resetPassword(formData: FormData) {
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
