"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  BarChart3,
  Target,
  PiggyBank,
  TrendingUp,
  CalendarDays,
  Bot,
  Trophy,
  Settings,
  LogOut,
  Zap,
} from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/useAuth";
import { useAppStore } from "@/store/useAppStore";
import { AppButton } from "@/components/ui/AppButton";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard",       href: "/dashboard",    premium: false },
  { icon: ArrowLeftRight,  label: "Transactions",    href: "/transactions", premium: false },
  { icon: BarChart3,       label: "Reports",         href: "/reports",      premium: false },
  { icon: Target,          label: "Budgets",         href: "/budgets",      premium: false },
  { icon: PiggyBank,       label: "Savings Goals",   href: "/savings",      premium: false },
  { icon: TrendingUp,      label: "Investments",     href: "/investments",  premium: true  },
  { icon: CalendarDays,    label: "Calendar",        href: "/calender",     premium: false },
  { icon: Bot,             label: "AI Assistant",    href: "/ai-assistant", premium: false },
  { icon: Trophy,          label: "Tasks & Rewards", href: "/tasks",        premium: false },
  { icon: Settings,        label: "Settings",        href: "/settings",     premium: false },
] as const;

const ACCOUNT_BADGE: Record<string, string> = {
  individual: "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300",
  family:     "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  business:   "bg-gold-100 text-gold-700 dark:bg-gold-900/30 dark:text-gold-300",
};

export default function Sidebar() {
  const pathname                = usePathname();
  const router                  = useRouter();
  const { user, signOut }       = useAuth();
  const { profile, setProfile } = useAppStore();

  useEffect(() => {
    if (!user || profile) return;
    const supabase = createClient();
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
      .then(({ data }) => { if (data) setProfile(data); });
  }, [user, profile, setProfile]);

  const displayName = profile?.full_name ?? user?.email ?? "User";
  const accountType = profile?.account_type ?? "individual";
  const avatarText  = initials(profile?.full_name ?? user?.email ?? "U");

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-[260px] z-40 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">

      {/* Logo */}
      <div className="flex items-center h-16 px-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <Image
          src="/assets/full_logo_dark.png"
          alt="TrackFlow"
          width={140}
          height={36}
          className="object-contain h-8 w-auto dark:hidden"
          priority
        />
        <Image
          src="/assets/full_logo_light.png"
          alt="TrackFlow"
          width={140}
          height={36}
          className="object-contain h-8 w-auto hidden dark:block"
          priority
        />
      </div>

      {/* User */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="w-9 h-9 rounded-full bg-gradient-brand flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden">
          {profile?.avatar_url
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
            : avatarText
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{displayName}</p>
          <span className={cn(
            "text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize",
            ACCOUNT_BADGE[accountType] ?? ACCOUNT_BADGE.individual
          )}>
            {accountType}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto no-scrollbar py-3 px-2 space-y-0.5">
        {NAV_ITEMS.map(({ icon: Icon, label, href, premium }) => {
          const isActive =
            href === "/dashboard"
              ? pathname === href
              : pathname === href || pathname.startsWith(href + "/") || pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative",
                isActive
                  ? "bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 border-l-2 border-gold-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 shrink-0 transition-colors",
                isActive
                  ? "text-brand-600 dark:text-brand-400"
                  : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
              )} />
              <span className="flex-1">{label}</span>
              {premium && (
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-gradient-gold text-navy leading-none">
                  PRO
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="shrink-0 px-3 pb-4 pt-3 space-y-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 px-2">
          <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse-slow" />
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Free Plan</span>
        </div>

        {/* Upgrade CTA */}
        <div className="rounded-2xl bg-gradient-to-br from-gold-50 to-amber-50/60 dark:from-gold-900/10 dark:to-amber-900/5 border border-gold-200 dark:border-gold-800/30 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-gold-500 shrink-0" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Unlock TrackFlow Pro</p>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            AI insights, unlimited budgets &amp; more.
          </p>
          <AppButton
            variant="gold"
            size="sm"
            fullWidth
            onClick={() => router.push("/settings/subscription")}
          >
            Upgrade Now
          </AppButton>
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
