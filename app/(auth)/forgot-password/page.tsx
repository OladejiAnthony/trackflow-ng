"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { AppButton as Button } from "@/components/ui/AppButton";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { forgotPassword } from "../actions";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

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
      const result = await forgotPassword(fd);
      if (result?.error) {
        setServerError(result.error);
      } else {
        setSent(true);
      }
    });
  }

  if (sent) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="w-20 h-20 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-brand-400" />
        </div>
        <h2 className="text-2xl font-bold font-display text-white mb-3">
          Reset link sent!
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto mb-8">
          Check your email for a password reset link. If you don&apos;t see it,
          check your spam folder.
        </p>
        <Link href="/login" className="btn-outline border-slate-600 text-slate-300 px-8 py-3">
          <ArrowLeft className="w-4 h-4" />
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
          Forgot password?
        </h1>
        <p className="text-slate-400 text-sm mt-1 text-center max-w-xs">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      {/* Card */}
      <div className="glass rounded-3xl p-8 shadow-card-xl border border-white/10">
        {serverError && (
          <Alert variant="error" className="mb-5">
            {serverError}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            leftIcon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            autoComplete="email"
            hint="We'll send a reset link to this address"
            {...register("email")}
          />

          <Button
            type="submit"
            fullWidth
            loading={isPending}
            size="lg"
            className="mt-2"
          >
            Send Reset Link
            <Mail className="w-4 h-4" />
          </Button>
        </form>

        <div className="flex justify-center mt-6">
          <Link
            href="/login"
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
