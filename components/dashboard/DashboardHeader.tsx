"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { formatDate, initials } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/useAuth";
import { useAppStore } from "@/store/useAppStore";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardHeader() {
  const { user }   = useAuth();
  const { profile } = useAppStore();
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const firstName  = profile?.full_name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "there";
  const avatarText = initials(profile?.full_name ?? user?.email ?? "U");

  return (
    <div className="flex items-start justify-between">
      <div className="animate-slide-up">
        <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <span>🇳🇬</span>
          {formatDate(now, "EEEE, dd MMMM yyyy")}
        </p>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">
          {getGreeting()},{" "}
          <span className="text-brand-600 dark:text-brand-400">{firstName}</span>{" "}
          👋
        </h1>
      </div>

      <div className="flex items-center gap-2 animate-fade-in">
        <Link
          href="/settings/notifications"
          className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 shadow-card hover:shadow-card-md transition-shadow"
        >
          <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gold-500" />
        </Link>
        <Link
          href="/settings/profile"
          className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center text-white text-sm font-bold shadow-card overflow-hidden"
        >
          {profile?.avatar_url
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={profile.avatar_url} alt={firstName} className="w-full h-full object-cover" />
            : avatarText
          }
        </Link>
      </div>
    </div>
  );
}
