"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { TRANSACTION_CATEGORIES } from "@/lib/utils";
// ─── Step 2: Save profile details ────────────────────────────────────────────

export async function saveOnboardingProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const avatar_url    = formData.get("avatar_url") as string | null;
  const date_of_birth = formData.get("date_of_birth") as string | null;
  const state         = formData.get("state") as string | null;

  if (!avatar_url && !date_of_birth && !state) return { success: true };

  const updatePayload = {
    ...(avatar_url    ? { avatar_url }    : {}),
    ...(date_of_birth ? { date_of_birth } : {}),
    ...(state         ? { state }         : {}),
  };

  const { error } = await supabase.from("profiles").update(updatePayload).eq("id", user.id);

  if (error) {
    // If the schema cache doesn't know about date_of_birth / state yet,
    // retry with only the fields that are guaranteed to exist.
    const isSchemaError =
      error.message.includes("column") ||
      error.message.includes("schema cache") ||
      (error as { code?: string }).code === "PGRST204";

    if (isSchemaError) {
      const safePayload: Record<string, string> = {};
      if (avatar_url) safePayload.avatar_url = avatar_url;
      if (Object.keys(safePayload).length > 0) {
        const { error: retryError } = await supabase
          .from("profiles")
          .update(safePayload)
          .eq("id", user.id);
        if (retryError) return { error: retryError.message };
      }
      return { success: true };
    }

    return { error: error.message };
  }

  return { success: true };
}

// ─── Step 3: Save income + create starter budgets ────────────────────────────

export async function saveOnboardingBudget(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const incomeRaw       = formData.get("monthly_income") as string;
  const budgetLimitRaw  = formData.get("budget_limit")   as string;
  const categories      = formData.getAll("categories")   as string[];

  const monthly_income = incomeRaw  ? parseFloat(incomeRaw.replace(/[^0-9.]/g, ""))  : null;
  const budget_limit   = budgetLimitRaw ? parseFloat(budgetLimitRaw.replace(/[^0-9.]/g, "")) : null;

  // Update income
  if (monthly_income !== null) {
    const { error } = await supabase
      .from("profiles")
      .update({ monthly_income })
      .eq("id", user.id);
    if (error) return { error: error.message };
  }

  // Create one budget entry per selected category
  if (categories.length > 0) {
    const now       = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    const endDate   = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
    const perCategory = budget_limit
      ? Math.round(budget_limit / categories.length)
      : 50_000;

    const budgets = categories.map((cat) => ({
      user_id:         user.id,
      name:            `${TRANSACTION_CATEGORIES[cat as keyof typeof TRANSACTION_CATEGORIES]?.label ?? cat} Budget`,
      category:        cat,
      amount:          perCategory,
      spent:           0,
      period:          "monthly" as const,
      start_date:      startDate,
      end_date:        endDate,
      alert_threshold: 80,
      is_active:       true,
    }));

    const { error } = await supabase.from("budgets").insert(budgets);
    if (error) return { error: error.message };
  }

  return { success: true };
}

// ─── Step 5: Mark onboarding complete ────────────────────────────────────────

export async function completeOnboarding() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update({ onboarding_completed: true })
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return { success: true };
}
