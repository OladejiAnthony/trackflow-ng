"use client";

import { usePathname } from "next/navigation";

const STEPS = [
  { path: "/onboarding/welcome",           label: "Welcome"       },
  { path: "/onboarding/setup-profile",     label: "Profile"       },
  { path: "/onboarding/setup-budget",      label: "Budget"        },
  { path: "/onboarding/grant-permissions", label: "Notifications" },
  { path: "/onboarding/done",              label: "Done"          },
];

export function OnboardingProgress() {
  const pathname = usePathname();
  const currentIndex = STEPS.findIndex((s) => pathname.startsWith(s.path));
  const step = currentIndex === -1 ? 0 : currentIndex;
  const total = STEPS.length;
  const pct   = ((step + 1) / total) * 100;

  return (
    <div className="w-full max-w-xs flex flex-col gap-1.5">
      {/* Bar */}
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      {/* Step label */}
      <p className="text-xs text-slate-500 text-right">
        Step {step + 1} of {total} — {STEPS[step]?.label}
      </p>
    </div>
  );
}
