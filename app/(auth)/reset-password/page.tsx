"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, ArrowRight, CheckCircle } from "lucide-react";
import { AppButton as Button } from "@/components/ui/AppButton";
import { PasswordInput } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { resetPassword } from "../actions";

const schema = z
  .object({
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "One uppercase letter")
      .regex(/[0-9]/, "One number"),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type FormData = z.infer<typeof schema>;

const passwordRules = [
  { test: (v: string) => v.length >= 8, label: "8+ characters" },
  { test: (v: string) => /[A-Z]/.test(v), label: "Uppercase" },
  { test: (v: string) => /[0-9]/.test(v), label: "Number" },
];

export default function ResetPasswordPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [tokenReady, setTokenReady] = useState(false);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const passwordValue = watch("password", "");

  // ── Token exchange ────────────────────────────────────────────────────────────
  // Supabase password reset sends an email with a link that either:
  //   a) Contains a hash fragment (#access_token=...&type=recovery) — implicit flow
  //   b) Redirects through /api/auth/callback which sets a session cookie — PKCE flow
  // We handle both here.
  useEffect(() => {
    const supabase = createClient();

    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const type = params.get("type");

    if (accessToken && refreshToken && type === "recovery") {
      // Hash / implicit flow — exchange tokens directly
      supabase.auth
        .setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ error }) => {
          if (error) {
            setTokenError(
              "This reset link is invalid or has expired. Please request a new one."
            );
          } else {
            setTokenReady(true);
            // Remove tokens from the URL bar
            window.history.replaceState(null, "", window.location.pathname);
          }
        });
    } else {
      // PKCE flow — session already established via cookie by /api/auth/callback
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setTokenReady(true);
        } else {
          setTokenError(
            "This reset link is invalid or has expired. Please request a new one."
          );
        }
      });
    }
  }, []);

  // ── Submit ────────────────────────────────────────────────────────────────────
  function onSubmit(data: FormData) {
    setServerError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("password", data.password);
      const result = await resetPassword(fd);
      if (result?.error) {
        setServerError(result.error);
      } else {
        setDone(true);
      }
    });
  }

  // ── Success state ─────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-brand-400" />
          </div>
        </div>
        <h2 className="text-2xl font-bold font-display text-white mb-3">
          Password updated!
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto mb-8">
          Your password has been changed successfully. You can now sign in with
          your new password.
        </p>
        <Link href="/dashboard">
          <Button variant="brand" size="lg">
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    );
  }

  // ── Invalid token state ───────────────────────────────────────────────────────
  if (tokenError) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="glass rounded-3xl p-8 shadow-card-xl border border-white/10">
          <Alert variant="error" className="mb-6 text-left">
            {tokenError}
          </Alert>
          <Link href="/forgot-password">
            <Button variant="brand" fullWidth size="lg">
              Request a New Reset Link
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Loading (waiting for token check) ─────────────────────────────────────────
  if (!tokenReady) {
    return (
      <div className="w-full max-w-md">
        <div className="glass rounded-3xl p-8 shadow-card-xl border border-white/10 animate-pulse">
          <div className="h-6 skeleton rounded-lg mb-6 w-40 mx-auto" />
          <div className="h-12 skeleton rounded-xl mb-4" />
          <div className="h-12 skeleton rounded-xl mb-4" />
          <div className="h-12 skeleton rounded-xl" />
        </div>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <Image
          src="/assets/icon_mark_dark.png"
          alt="TrackFlow"
          width={52}
          height={52}
          priority
          className="mb-4"
        />
        <h1 className="text-2xl font-bold font-display text-white tracking-tight">
          Set new password
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Choose a strong password for your account
        </p>
      </div>

      <div className="glass rounded-3xl p-8 shadow-card-xl border border-white/10">
        {serverError && (
          <Alert variant="error" className="mb-5">
            {serverError}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Password + strength meter */}
          <div>
            <PasswordInput
              label="New password"
              placeholder="Min. 8 characters"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              autoComplete="new-password"
              {...register("password")}
            />
            {passwordValue && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {passwordRules.map((rule) => (
                  <span
                    key={rule.label}
                    className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors border",
                      rule.test(passwordValue)
                        ? "bg-green-500/15 text-green-400 border-green-500/20"
                        : "bg-slate-700/50 text-slate-500 border-slate-700"
                    )}
                  >
                    {rule.test(passwordValue) ? "✓ " : ""}
                    {rule.label}
                  </span>
                ))}
              </div>
            )}
          </div>

          <PasswordInput
            label="Confirm new password"
            placeholder="Re-enter new password"
            leftIcon={<Lock className="w-4 h-4" />}
            error={errors.confirm_password?.message}
            autoComplete="new-password"
            {...register("confirm_password")}
          />

          <Button
            type="submit"
            fullWidth
            loading={isPending}
            size="lg"
            className="mt-2"
          >
            Update Password
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
