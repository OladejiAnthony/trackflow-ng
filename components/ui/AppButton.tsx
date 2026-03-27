"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes, forwardRef } from "react";

export interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "brand" | "gold" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<NonNullable<AppButtonProps["variant"]>, string> = {
  brand:
    "text-white font-semibold shadow-brand hover:opacity-95 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 bg-gradient-brand",
  gold:
    "text-white font-semibold shadow-gold hover:opacity-95 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-gold",
  outline:
    "border-2 border-brand-500 text-brand-600 dark:text-brand-400 font-semibold hover:bg-brand-50 dark:hover:bg-brand-950/50 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
  ghost:
    "text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
  danger:
    "text-white font-semibold hover:opacity-95 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-danger",
};

const sizeClasses: Record<NonNullable<AppButtonProps["size"]>, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-base",
};

export const AppButton = forwardRef<HTMLButtonElement, AppButtonProps>(
  (
    {
      variant = "brand",
      size = "md",
      loading = false,
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl transition-all duration-150",
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Please wait…</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

AppButton.displayName = "AppButton";
