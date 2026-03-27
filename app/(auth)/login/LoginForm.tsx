"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, PasswordInput } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { loginWithEmail, loginWithGoogle } from "../actions";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";
  const callbackError = searchParams.get("error");

  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [googlePending, setGooglePending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  function onSubmit(data: FormData) {
    setServerError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("email", data.email);
      fd.set("password", data.password);
      fd.set("redirect", redirect);
      const result = await loginWithEmail(fd);
      if (result?.error) setServerError(result.error);
    });
  }

  async function handleGoogle() {
    setGooglePending(true);
    await loginWithGoogle();
    setGooglePending(false);
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-brand shadow-brand flex items-center justify-center mb-4">
          <span className="text-white font-bold font-display text-2xl">T</span>
        </div>
        <h1 className="text-2xl font-bold font-display text-white tracking-tight">
          Welcome back
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Sign in to your TrackFlow account
        </p>
      </div>

      {/* Card */}
      <div className="glass rounded-3xl p-8 shadow-card-xl border border-white/10">
        {callbackError === "auth_callback_failed" && (
          <Alert variant="error" className="mb-5">
            Authentication failed. Please try again.
          </Alert>
        )}
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
          Continue with Google
        </Button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-slate-700" />
          <span className="text-xs text-slate-500 font-medium">or sign in with email</span>
          <div className="flex-1 h-px bg-slate-700" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              autoComplete="current-password"
              {...register("password")}
            />
            <div className="flex justify-end mt-2">
              <Link
                href="/forgot-password"
                className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            fullWidth
            loading={isPending}
            size="lg"
            className="mt-2"
          >
            Sign In
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          New to TrackFlow?{" "}
          <Link
            href="/register"
            className="text-brand-400 hover:text-brand-300 font-semibold transition-colors"
          >
            Create a free account
          </Link>
        </p>
      </div>

      <p className="text-center text-xs text-slate-600 mt-6">
        By signing in you agree to our{" "}
        <span className="text-slate-500 underline cursor-pointer">Terms</span> &{" "}
        <span className="text-slate-500 underline cursor-pointer">Privacy Policy</span>
      </p>
    </div>
  );
}
