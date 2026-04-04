"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, ArrowLeftRight, BarChart3, User, Plus, LogOut, Users2, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

type Tab = {
  icon: React.ElementType;
  label: string;
  href: string;
  accountType?: "family" | "business";
};

const BASE_TABS: (Tab | null)[] = [
  { icon: House,          label: "Home",         href: "/dashboard" },
  { icon: ArrowLeftRight, label: "Transactions", href: "/transactions" },
  null, // FAB placeholder
  { icon: BarChart3,      label: "Reports",      href: "/reports" },
  { icon: Users2,         label: "Family",       href: "/family",   accountType: "family"   },
  { icon: Briefcase,      label: "Business",     href: "/business", accountType: "business" },
  { icon: User,           label: "Profile",      href: "/settings/profile" },
];

export default function BottomNav() {
  const pathname               = usePathname();
  const { setAddTransactionOpen, setLogoutModalOpen, profile } = useAppStore();

  const tabs = BASE_TABS.filter((tab) => {
    if (!tab) return true; // keep FAB placeholder
    if (tab.accountType) return tab.accountType === profile?.account_type;
    return true;
  });

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 z-50 lg:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 safe-bottom">
      <div className="flex items-center justify-around h-full max-w-lg mx-auto px-1">
        {tabs.map((tab, i) => {
          if (tab === null) {
            return (
              <button
                key="fab"
                onClick={() => setAddTransactionOpen(true)}
                aria-label="Add transaction"
                className="w-14 h-14 -mt-5 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold active:scale-95 transition-transform shrink-0"
              >
                <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
              </button>
            );
          }

          const Icon     = tab.icon;
          const isActive =
            tab.href === "/dashboard"
              ? pathname === tab.href
              : pathname === tab.href || pathname.startsWith(tab.href + "/") || pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href ?? i}
              href={tab.href}
              className="flex flex-col items-center gap-1 flex-1 py-2 group min-w-0"
            >
              <div className="relative flex items-center justify-center">
                <Icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive
                    ? "text-brand-600 dark:text-brand-400"
                    : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                )} />
                {isActive && (
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-500" />
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium truncate",
                isActive ? "text-brand-600 dark:text-brand-400" : "text-slate-400 dark:text-slate-500"
              )}>
                {tab.label}
              </span>
            </Link>
          );
        })}
        {/* Logout */}
        <button
          onClick={() => setLogoutModalOpen(true)}
          aria-label="Sign out"
          className="flex flex-col items-center gap-1 flex-1 py-2 group min-w-0"
        >
          <div className="relative flex items-center justify-center">
            <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-500 transition-colors" />
          </div>
          <span className="text-[10px] font-medium truncate text-red-400 group-hover:text-red-500">
            Sign out
          </span>
        </button>
      </div>
    </nav>
  );
}
