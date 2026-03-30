"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, ArrowRight } from "lucide-react";
import { AppButton as Button } from "@/components/ui/AppButton";
import { PasswordInput } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { resetPassword } from "../actions";

const schema = z
  .object({
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

export default function ResetPasswordPage() {
  const [serverError, setServerError] = useState<string | null>(null);
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
      fd.set("password", data.password);
      const result = await resetPassword(fd);
      if (result?.error) setServerError(result.error);
    });
  }

  return (
    <div className="w-full max-w-md">
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
          <PasswordInput
            label="New password"
            placeholder="Min. 8 characters"
            leftIcon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            autoComplete="new-password"
            {...register("password")}
          />

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
