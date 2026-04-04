"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { AppButton as Button } from "@/components/ui/AppButton";
import { Alert } from "@/components/ui/Alert";
import { cn } from "@/lib/utils";
import { saveAccountType } from "../actions";

const ACCOUNT_TYPES = [
  {
    value: "individual",
    emoji: "👤",
    label: "Individual",
    description: "Track your personal income, expenses, and savings goals",
  },
  {
    value: "family",
    emoji: "👨‍👩‍👧‍👦",
    label: "Family",
    description: "Manage household budgets and track spending together",
  },
  {
    value: "business",
    emoji: "💼",
    label: "Business",
    description: "Separate business income, expenses, and financial reports",
  },
] as const;

type AccountTypeValue = typeof ACCOUNT_TYPES[number]["value"];

export default function AccountTypePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<AccountTypeValue>("individual");
  const [error, setError]       = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Pre-select the account type already stored on the profile (set by the
  // handle_new_user trigger during registration) so we don't accidentally
  // overwrite a correctly-set "family" or "business" with the "individual" default.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("profiles")
        .select("account_type")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.account_type && ACCOUNT_TYPES.some(t => t.value === data.account_type)) {
            setSelected(data.account_type as AccountTypeValue);
          }
        });
    });
  }, []);

  function handleContinue() {
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("account_type", selected);
      const result = await saveAccountType(fd);
      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/onboarding/setup-profile");
      }
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-md"
    >
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold font-display text-white tracking-tight mb-2">
          How will you use TrackFlow?
        </h1>
        <p className="text-slate-400 text-sm">
          Choose your account type — you can always change this later
        </p>
      </div>

      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/10 shadow-card-xl space-y-6 auth-panel">
        {error && <Alert variant="error" onDismiss={() => setError(null)}>{error}</Alert>}

        <div className="flex flex-col gap-3">
          {ACCOUNT_TYPES.map((type) => {
            const isSelected = selected === type.value;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => setSelected(type.value)}
                className={cn(
                  "flex items-center gap-4 px-5 py-4 rounded-2xl border text-left transition-all duration-200",
                  isSelected
                    ? "border-brand-500/60 bg-brand-500/10"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
                )}
              >
                <span className="text-3xl leading-none flex-shrink-0">{type.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{type.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{type.description}</p>
                </div>
                <span
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                    isSelected
                      ? "border-brand-500 bg-brand-500"
                      : "border-white/20 bg-transparent"
                  )}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </span>
              </button>
            );
          })}
        </div>

        <Button
          type="button"
          variant="brand"
          fullWidth
          size="lg"
          loading={isPending}
          onClick={handleContinue}
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
