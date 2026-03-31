"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useTransition } from "react";
import { Mail, Send, ArrowLeft, CheckCircle, ArrowRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AppButton as Button } from "@/components/ui/AppButton";
import { Alert } from "@/components/ui/Alert";
import { resendVerificationEmail } from "../actions";

const RESEND_COOLDOWN = 60;

function GoogleVerifiedContent() {
  return (
    <div className="w-full max-w-md text-center">
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
          You&apos;re all set!
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          One last step — finish setting up your account
        </p>
      </div>

      <div className="glass rounded-3xl p-8 shadow-card-xl border border-white/10">
        {/* Check icon */}
        <div className="flex justify-center mb-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #0D1B3E 0%, #0A6E5E 60%, #10B981 100%)" }}
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
        </div>

        <p className="text-white font-semibold text-base mb-2">
          Google account verified
        </p>
        <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto mb-8">
          Your email is confirmed via Google. Let&apos;s finish setting up your TrackFlow account.
        </p>

        <Link href="/onboarding/account-type">
          <Button variant="gold" fullWidth>
            Continue to Setup
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

function EmailVerifyContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [cooldown, setCooldown] = useState(0);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleResend() {
    if (cooldown > 0 || !email) return;
    setResendError(null);
    setResendSuccess(false);
    startTransition(async () => {
      const result = await resendVerificationEmail(email);
      if (result?.error) {
        setResendError(result.error);
      } else {
        setResendSuccess(true);
        let remaining = RESEND_COOLDOWN;
        setCooldown(remaining);
        const interval = setInterval(() => {
          remaining -= 1;
          setCooldown(remaining);
          if (remaining <= 0) clearInterval(interval);
        }, 1000);
      }
    });
  }

  return (
    <div className="w-full max-w-md text-center">
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
          Check your inbox
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          One last step — verify your email to get started
        </p>
      </div>

      <div className="glass rounded-3xl p-8 shadow-card-xl border border-white/10">
        {/* Envelope icon */}
        <div className="flex justify-center mb-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #0D1B3E 0%, #0A6E5E 60%, #10B981 100%)" }}
          >
            <Mail className="w-10 h-10 text-white" />
          </div>
        </div>

        {email ? (
          <>
            <p className="text-slate-400 text-sm mb-1">We sent a confirmation link to</p>
            <p className="text-brand-400 font-semibold text-sm mb-4 break-all">{email}</p>
          </>
        ) : (
          <p className="text-slate-400 text-sm mb-4">
            We sent a confirmation link to your email address.
          </p>
        )}

        <p className="text-slate-500 text-xs leading-relaxed max-w-xs mx-auto mb-6">
          Click the link in the email to activate your account. Check your spam
          or junk folder if you don&apos;t see it within a few minutes.
        </p>

        {resendError && (
          <Alert variant="error" className="mb-4 text-left">
            {resendError}
          </Alert>
        )}
        {resendSuccess && (
          <Alert variant="success" className="mb-4 text-left">
            Verification email resent — check your inbox.
          </Alert>
        )}

        {email && (
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={handleResend}
            loading={isPending}
            disabled={cooldown > 0}
            className="border-slate-600 text-slate-300 hover:bg-slate-800/50 mb-4"
          >
            <Send className="w-4 h-4" />
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend verification email"}
          </Button>
        )}

        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const source = searchParams.get("source");

  if (source === "google") {
    return <GoogleVerifiedContent />;
  }

  return <EmailVerifyContent />;
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md glass rounded-3xl p-8 border border-white/10 animate-pulse">
          <div className="h-20 w-20 skeleton rounded-full mx-auto mb-6" />
          <div className="h-6 skeleton rounded-lg mb-3 w-48 mx-auto" />
          <div className="h-4 skeleton rounded-lg mb-6 w-64 mx-auto" />
          <div className="h-12 skeleton rounded-xl" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
