"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Users,
  Building2,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Send,
} from "lucide-react";
import { AppButton as Button } from "@/components/ui/AppButton";
import { Input, PasswordInput } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import {
  registerWithEmail,
  loginWithGoogle,
  resendVerificationEmail,
  checkEmailAvailable,
} from "../actions";

// ─── Account type definitions ─────────────────────────────────────────────────

type AccountTypeId = "individual" | "family" | "sme";

const ACCOUNT_TYPES: {
  id: AccountTypeId;
  icon: React.ElementType;
  title: string;
  description: string;
  benefits: string[];
}[] = [
    {
      id: "individual",
      icon: User,
      title: "Individual",
      description: "Personal finance tracking for everyday Nigerians",
      benefits: [
        "Personal spending tracker",
        "Budget alerts",
        "Savings goals",
        "AI insights",
      ],
    },
    {
      id: "family",
      icon: Users,
      title: "Family",
      description: "Manage household finances together as one unit",
      benefits: [
        "Shared household budget",
        "Family member tracking",
        "Joint savings goals",
        "Expense splitting",
      ],
    },
    {
      id: "sme",
      icon: Building2,
      title: "SME / Business",
      description: "Track cashflow and manage business expenses",
      benefits: [
        "Business expense tracking",
        "Revenue monitoring",
        "Staff expenses",
        "Tax-ready reports",
      ],
    },
  ];

// ─── Step 2 validation schema ─────────────────────────────────────────────────

const detailsSchema = z
  .object({
    full_name: z.string().min(2, "Enter your full name"),
    email: z.string().email("Enter a valid email address"),
    phone: z
      .string()
      .regex(/^[0-9]{10,11}$/, "Enter 10–11 digits after +234 (e.g. 8012345678)"),
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "One uppercase letter")
      .regex(/[0-9]/, "One number"),
    confirm_password: z.string(),
    business_name: z.string().optional(),
    terms: z.boolean().refine((v) => v === true, "You must accept the terms"),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type DetailsFormData = z.infer<typeof detailsSchema>;

const passwordRules = [
  { test: (v: string) => v.length >= 8, label: "8+ characters" },
  { test: (v: string) => /[A-Z]/.test(v), label: "Uppercase" },
  { test: (v: string) => /[0-9]/.test(v), label: "Number" },
];

// ─── Step progress indicator ──────────────────────────────────────────────────

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2 mb-8 justify-center">
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          className={cn(
            "h-1.5 rounded-full transition-all duration-300",
            s === step
              ? "w-8 bg-brand-500"
              : s < step
                ? "w-4 bg-brand-500/50"
                : "w-4 bg-white/20"
          )}
        />
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function RegisterForm() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [accountType, setAccountType] = useState<AccountTypeId | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendError, setResendError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [isPending, startTransition] = useTransition();
  const [googlePending, setGooglePending] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<DetailsFormData>({
    resolver: zodResolver(detailsSchema),
    mode: "onChange",
  });

  const passwordValue = watch("password", "");
  const emailValue = watch("email", "");

  // ── Debounced email availability check ──────────────────────────────────────
  const checkEmail = useCallback(async (email: string) => {
    const valid = z.string().email().safeParse(email).success;
    if (!valid) { setEmailStatus("idle"); return; }
    setEmailStatus("checking");
    try {
      const result = await checkEmailAvailable(email);
      setEmailStatus(result.available ? "available" : "taken");
    } catch {
      setEmailStatus("idle");
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!emailValue) { setEmailStatus("idle"); return; }
    debounceRef.current = setTimeout(() => checkEmail(emailValue), 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [emailValue, checkEmail]);

  // ── Resend cooldown countdown ────────────────────────────────────────────────
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  function onDetailsSubmit(data: DetailsFormData) {
    if (emailStatus === "taken") return;
    setServerError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("email", data.email);
      fd.set("password", data.password);
      fd.set("full_name", data.full_name);
      fd.set("phone", `+234${data.phone}`);
      fd.set("account_type", accountType!);
      if (data.business_name) fd.set("business_name", data.business_name);

      const result = await registerWithEmail(fd);
      if (result?.error) {
        setServerError(result.error);
      } else {
        setRegisteredEmail(data.email);
        setStep(3);
      }
    });
  }

  async function handleResend() {
    setResendError(null);
    const result = await resendVerificationEmail(registeredEmail);
    if (result?.error) {
      setResendError(result.error);
    } else {
      setResendCooldown(60);
    }
  }

  async function handleGoogle() {
    setGooglePending(true);
    await loginWithGoogle();
    setGooglePending(false);
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div
      className={cn(
        "w-full transition-all duration-300",
        step === 1 ? "max-w-3xl" : "max-w-md"
      )}
    >
      {/* Logo */}
      <div className="flex flex-col items-center mb-6">
        <Image
          src="/assets/icon_mark_dark.png"
          alt="TrackFlow"
          width={48}
          height={48}
          priority
          className="mb-4"
        />
        <h1 className="text-2xl font-bold font-display text-white tracking-tight">
          {step === 1 && "Choose account type"}
          {step === 2 && "Create your account"}
          {step === 3 && "Verify your email"}
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {step === 1 && "Select how you'll use TrackFlow"}
          {step === 2 && "Fill in your details to get started"}
          {step === 3 && "One last step — check your inbox"}
        </p>
      </div>

      <StepIndicator step={step} />

      <AnimatePresence mode="wait">
        {/* ── STEP 1: Account Type ── */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {ACCOUNT_TYPES.map(({ id, icon: Icon, title, description, benefits }) => {
                const selected = accountType === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setAccountType(id)}
                    className={cn(
                      "rounded-2xl border-2 p-6 text-left cursor-pointer transition-all duration-200 focus:outline-none",
                      selected
                        ? "border-gold-500 bg-gold-500/10 shadow-glow-gold"
                        : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08]"
                    )}
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors",
                        selected ? "bg-gold-500/20" : "bg-white/10"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-6 h-6 transition-colors",
                          selected ? "text-gold-400" : "text-slate-400"
                        )}
                      />
                    </div>

                    {/* Title + description */}
                    <h3
                      className={cn(
                        "font-semibold font-display text-base mb-1 transition-colors",
                        selected ? "text-gold-300" : "text-white"
                      )}
                    >
                      {title}
                    </h3>
                    <p className="text-slate-400 text-xs leading-relaxed mb-4">
                      {description}
                    </p>

                    {/* Benefits */}
                    <ul className="space-y-1.5">
                      {benefits.map((b) => (
                        <li key={b} className="flex items-center gap-2">
                          <CheckCircle2
                            className={cn(
                              "w-3.5 h-3.5 shrink-0 transition-colors",
                              selected ? "text-brand-400" : "text-slate-600"
                            )}
                          />
                          <span
                            className={cn(
                              "text-xs transition-colors",
                              selected ? "text-slate-300" : "text-slate-500"
                            )}
                          >
                            {b}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>

            <Button
              type="button"
              variant="brand"
              fullWidth
              size="lg"
              disabled={!accountType}
              onClick={() => setStep(2)}
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>

            <p className="text-center text-sm text-slate-400 mt-5">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-brand-400 hover:text-brand-300 font-semibold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </motion.div>
        )}

        {/* ── STEP 2: Personal Details ── */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="glass rounded-3xl p-8 shadow-card-xl border border-white/10">
              {/* Back button */}
              <button
                type="button"
                onClick={() => { setServerError(null); setStep(1); }}
                className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              {serverError && (
                <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {serverError}
                </div>
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

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-slate-700" />
                <span className="text-xs text-slate-500 font-medium">or with email</span>
                <div className="flex-1 h-px bg-slate-700" />
              </div>

              <form onSubmit={handleSubmit(onDetailsSubmit)} className="space-y-4">
                {/* Full Name */}
                <Input
                  label="Full name"
                  type="text"
                  placeholder="Chidi Okeke"
                  leftIcon={<User className="w-4 h-4" />}
                  error={errors.full_name?.message}
                  autoComplete="name"
                  {...register("full_name")}
                />

                {/* Email */}
                <div>
                  <Input
                    label="Email address"
                    type="email"
                    placeholder="you@example.com"
                    leftIcon={<Mail className="w-4 h-4" />}
                    error={errors.email?.message}
                    autoComplete="email"
                    {...register("email")}
                  />
                  {!errors.email?.message && emailValue && (
                    <div className="mt-1.5 text-xs">
                      {emailStatus === "checking" && (
                        <span className="text-slate-400">Checking availability…</span>
                      )}
                      {emailStatus === "available" && (
                        <span className="text-green-400">✓ Email available</span>
                      )}
                      {emailStatus === "taken" && (
                        <span className="text-red-400">Email already in use</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Phone number
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-700 bg-white/5 shrink-0">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-300 font-medium">+234</span>
                    </div>
                    <input
                      type="tel"
                      placeholder="8012345678"
                      autoComplete="tel-national"
                      inputMode="numeric"
                      className={cn(
                        "input-field flex-1",
                        errors.phone ? "border-red-500 ring-2 ring-red-500/30" : ""
                      )}
                      {...register("phone")}
                    />
                  </div>
                  {errors.phone?.message && (
                    <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>
                  )}
                </div>

                {/* Business Name (SME only) */}
                {accountType === "sme" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.2 }}
                  >
                    <Input
                      label="Business name"
                      type="text"
                      placeholder="Acme Ltd."
                      leftIcon={<Building2 className="w-4 h-4" />}
                      error={errors.business_name?.message}
                      {...register("business_name")}
                    />
                  </motion.div>
                )}

                {/* Password */}
                <div>
                  <PasswordInput
                    label="Password"
                    labelClassName="text-slate-300"
                    placeholder="Min. 8 characters"
                    leftIcon={<Lock className="w-4 h-4" />}
                    error={errors.password?.message}
                    autoComplete="new-password"
                    {...register("password")}
                  />
                  {passwordValue && (
                    <div className=" flex flex-wrap gap-1.5">
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

                {/* Confirm Password */}
                <PasswordInput
                  label="Confirm Password"
                  labelClassName="text-slate-300"
                  placeholder="Re-enter your password"
                  leftIcon={<Lock className="w-4 h-4" />}
                  error={errors.confirm_password?.message}
                  autoComplete="new-password"
                  {...register("confirm_password")}
                />

                {/* Terms */}
                <div>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="mt-0.5 w-4 h-4 rounded border-slate-600 bg-white/5 accent-brand-500 cursor-pointer"
                      {...register("terms")}
                    />
                    <span className="text-xs text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                      I agree to the{" "}
                      <span className="text-brand-400 underline cursor-pointer">Terms of Service</span>
                      {" "}and{" "}
                      <span className="text-brand-400 underline cursor-pointer">Privacy Policy</span>
                    </span>
                  </label>
                  {errors.terms?.message && (
                    <p className="mt-1 text-xs text-red-400">{errors.terms.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="brand"
                  fullWidth
                  size="lg"
                  loading={isPending}
                  disabled={emailStatus === "taken"}
                  className="mt-2"
                >
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>

              <p className="text-center text-sm text-slate-400 mt-5">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-brand-400 hover:text-brand-300 font-semibold transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: Email Verification ── */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="text-center"
          >
            {/* Animated envelope */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="flex justify-center mb-6"
            >
              <div className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #0D1B3E 0%, #0A6E5E 60%, #10B981 100%)" }}
              >
                <Mail className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            <h2 className="text-2xl font-bold font-display text-white mb-3">
              Check your inbox
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto mb-2">
              We sent a confirmation link to
            </p>
            <p className="text-brand-400 font-semibold text-sm mb-6 break-all">
              {registeredEmail}
            </p>
            <p className="text-slate-500 text-xs leading-relaxed max-w-xs mx-auto mb-8">
              Click the link in the email to verify your account and get started. Check your spam folder if you don&apos;t see it.
            </p>

            {resendError && (
              <p className="mb-4 text-xs text-red-400">{resendError}</p>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="border-slate-600 text-slate-300 hover:bg-slate-800/50 mb-4"
            >
              <Send className="w-4 h-4" />
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend email"}
            </Button>

            <div>
              <Link
                href="/login"
                className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
