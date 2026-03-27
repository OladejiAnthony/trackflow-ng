"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, User, ArrowRight, CheckCircle } from "lucide-react";
import { AppButton as Button } from "@/components/ui/AppButton";
import { Input, PasswordInput } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { registerWithEmail, loginWithGoogle } from "../actions";

const schema = z
  .object({
    full_name: z.string().min(2, "Enter your full name"),
    email: z.string().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type FormData = z.infer<typeof schema>;

const passwordRules = [
  { test: (v: string) => v.length >= 8, label: "At least 8 characters" },
  { test: (v: string) => /[A-Z]/.test(v), label: "One uppercase letter" },
  { test: (v: string) => /[0-9]/.test(v), label: "One number" },
];

export default function RegisterPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [googlePending, setGooglePending] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema), mode: "onChange" });

  const passwordValue = watch("password", "");

  function onSubmit(data: FormData) {
    setServerError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("email", data.email);
      fd.set("password", data.password);
      fd.set("full_name", data.full_name);
      const result = await registerWithEmail(fd);
      if (result?.error) {
        setServerError(result.error);
      } else {
        setSuccess(true);
      }
    });
  }

  async function handleGoogle() {
    setGooglePending(true);
    await loginWithGoogle();
    setGooglePending(false);
  }

  if (success) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold font-display text-white mb-3">
          Check your inbox!
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto mb-8">
          We sent a confirmation link to your email. Click it to activate your
          TrackFlow account and start tracking your finances.
        </p>
        <Link href="/login" className="btn-brand px-8 py-3">
          Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-brand shadow-brand flex items-center justify-center mb-4">
          <span className="text-white font-bold font-display text-2xl">T</span>
        </div>
        <h1 className="text-2xl font-bold font-display text-white tracking-tight">
          Create your account
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Start tracking your finances in seconds
        </p>
      </div>

      {/* Card */}
      <div className="glass rounded-3xl p-8 shadow-card-xl border border-white/10">
        {serverError && (
          <Alert variant="error" className="mb-5">
            {serverError}
          </Alert>
        )}

        {/* Google OAuth */}
        <Button
          type="button"
          variant="outline"
          fullWidth
          onClick={handleGoogle}
          loading={googlePending}
          className="mb-5 border-slate-600 text-slate-200 hover:bg-slate-800/50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign up with Google
        </Button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-slate-700" />
          <span className="text-xs text-slate-500 font-medium">or with email</span>
          <div className="flex-1 h-px bg-slate-700" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full name"
            type="text"
            placeholder="Chidi Okeke"
            leftIcon={<User className="w-4 h-4" />}
            error={errors.full_name?.message}
            autoComplete="name"
            {...register("full_name")}
          />

          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            leftIcon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            autoComplete="email"
            {...register("email")}
          />

          <div>
            <PasswordInput
              label="Password"
              placeholder="Min. 8 characters"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              autoComplete="new-password"
              {...register("password")}
            />
            {/* Password strength indicators */}
            {passwordValue && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {passwordRules.map((rule) => (
                  <span
                    key={rule.label}
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors ${
                      rule.test(passwordValue)
                        ? "bg-green-500/15 text-green-400 border border-green-500/20"
                        : "bg-slate-700/50 text-slate-500 border border-slate-700"
                    }`}
                  >
                    {rule.test(passwordValue) ? "✓ " : ""}
                    {rule.label}
                  </span>
                ))}
              </div>
            )}
          </div>

          <PasswordInput
            label="Confirm password"
            placeholder="Re-enter your password"
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
            Create Account
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        {/* Login link */}
        <p className="text-center text-sm text-slate-400 mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-brand-400 hover:text-brand-300 font-semibold transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>

      <p className="text-center text-xs text-slate-600 mt-6">
        By creating an account you agree to our{" "}
        <span className="text-slate-500 underline cursor-pointer">Terms</span> &{" "}
        <span className="text-slate-500 underline cursor-pointer">Privacy Policy</span>
      </p>
    </div>
  );
}
