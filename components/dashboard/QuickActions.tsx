"use client";

import { useRouter } from "next/navigation";
import { PlusCircle, MinusCircle, Camera, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

const ACTIONS = [
  {
    icon:  PlusCircle,
    label: "Add Income",
    color: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    ring:  "hover:ring-2 hover:ring-green-400/30",
    type:  "income" as const,
  },
  {
    icon:  MinusCircle,
    label: "Add Expense",
    color: "bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400",
    ring:  "hover:ring-2 hover:ring-red-400/30",
    type:  "expense" as const,
  },
  {
    icon:  Camera,
    label: "Scan Receipt",
    color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    ring:  "hover:ring-2 hover:ring-blue-400/30",
    href:  "scan",
  },
  {
    icon:  MessageCircle,
    label: "Ask AI",
    color: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
    ring:  "hover:ring-2 hover:ring-purple-400/30",
    href:  "/ai-assistant",
  },
] as const;

export default function QuickActions() {
  const router                    = useRouter();
  const { setAddTransactionOpen, setInitialTransactionType } = useAppStore();

  function handleAction(action: typeof ACTIONS[number]) {
    if ("href" in action) {
      if (action.href === "scan") {
        toast.info("Receipt scanning coming soon!", { description: "Use camera to auto-fill transactions." });
      } else {
        router.push(action.href);
      }
    } else {
      setInitialTransactionType(action.type);
      setAddTransactionOpen(true);
    }
  }

  return (
    <div className="animate-slide-up">
      <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-widest">
        Quick Actions
      </h2>
      <div className="grid grid-cols-4 gap-3">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => handleAction(action)}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-card hover:shadow-card-md active:scale-95 transition-all duration-150",
                action.ring
              )}
            >
              <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", action.color)}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 text-center leading-tight">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
