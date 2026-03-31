"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bell, CheckCircle2, ArrowRight, Sun, Moon,
  Zap, AlertTriangle, MessageSquare, Shield, Lock,
} from "lucide-react";
import { AppButton as Button } from "@/components/ui/AppButton";
import { Alert } from "@/components/ui/Alert";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding  = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64   = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData  = window.atob(base64);
  const output   = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const PUSH_BENEFITS = [
  { icon: Sun,           text: "Morning money summary at 8:00 AM" },
  { icon: Moon,          text: "Evening spending recap at 8:00 PM" },
  { icon: Zap,           text: "Instant bank alert tracking" },
  { icon: AlertTriangle, text: "Budget limit warnings before you overspend" },
];

const SMS_BENEFITS = [
  { icon: MessageSquare, text: "Auto-logs debit & credit alerts" },
  { icon: Shield,        text: "Processed entirely on your device" },
  { icon: Lock,          text: "Never uploaded or stored in the cloud" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

type PermState = "idle" | "requesting" | "granted" | "denied" | "unsupported";

export default function GrantPermissionsPage() {
  const router = useRouter();

  const [pushState, setPushState]       = useState<PermState>("idle");
  const [pushError, setPushError]       = useState<string | null>(null);
  const [smsExpanded, setSmsExpanded]   = useState(false);

  async function handleEnableNotifications() {
    setPushError(null);

    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setPushState("unsupported");
      return;
    }

    setPushState("requesting");

    try {
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        setPushState("denied");
        return;
      }

      // Subscribe to push
      const registration = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!vapidKey) {
        // Dev mode without VAPID keys — just mark as granted
        setPushState("granted");
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as unknown as Uint8Array<ArrayBuffer>,
      });

      // Save subscription to DB
      const res = await fetch("/api/notifications/subscribe", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(subscription.toJSON()),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save subscription");
      }

      setPushState("granted");
    } catch (err) {
      setPushState("idle");
      setPushError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  function handleNext() {
    router.push("/onboarding/done");
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-md"
    >
      {/* ── Section 1: Push Notifications ──────────────────────────────────── */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-white/10 shadow-card-xl mb-4">
        {/* Animated bell */}
        <div className="flex justify-center mb-6">
          <motion.div
            animate={
              pushState === "idle"
                ? { rotate: [0, -15, 15, -10, 10, -5, 5, 0] }
                : {}
            }
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
            className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center",
              pushState === "granted"
                ? "bg-brand-500/20"
                : "bg-gradient-to-br from-gold-500/20 to-brand-500/20"
            )}
          >
            <Bell
              className={cn(
                "w-10 h-10",
                pushState === "granted" ? "text-brand-400" : "text-gold-400"
              )}
            />
          </motion.div>
        </div>

        <h1 className="text-2xl font-bold font-display text-white text-center tracking-tight mb-2">
          Get Daily Money Reminders
        </h1>
        <p className="text-slate-400 text-sm text-center mb-6">
          Stay on top of your finances with smart, timely alerts.
        </p>

        {/* Benefits */}
        <ul className="space-y-3 mb-6">
          {PUSH_BENEFITS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-brand-400" />
              </div>
              <span className="text-sm text-slate-300">{text}</span>
            </li>
          ))}
        </ul>

        {pushError && (
          <Alert variant="error" className="mb-4">
            {pushError}
          </Alert>
        )}

        {pushState === "granted" && (
          <Alert variant="success" className="mb-4">
            Notifications enabled! You&apos;ll get daily money summaries.
          </Alert>
        )}

        {pushState === "denied" && (
          <Alert variant="warning" className="mb-4">
            Notifications blocked. To enable them, update your browser settings and
            allow notifications for this site.
          </Alert>
        )}

        {pushState === "unsupported" && (
          <Alert variant="info" className="mb-4">
            Your browser doesn&apos;t support push notifications. You can still use
            TrackFlow — just without reminders.
          </Alert>
        )}

        {/* CTA */}
        {pushState !== "granted" ? (
          <Button
            type="button"
            variant="gold"
            fullWidth
            size="lg"
            loading={pushState === "requesting"}
            onClick={handleEnableNotifications}
          >
            <Bell className="w-4 h-4" />
            Enable Notifications
          </Button>
        ) : (
          <Button
            type="button"
            variant="brand"
            fullWidth
            size="lg"
            onClick={handleNext}
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}

        {pushState !== "granted" && (
          <button
            type="button"
            onClick={handleNext}
            className="w-full text-sm text-slate-500 hover:text-slate-300 transition-colors py-3"
          >
            Skip for now
          </button>
        )}
      </div>

      {/* ── Section 2: Bank SMS Auto-tracking ──────────────────────────────── */}
      <div className="glass rounded-3xl border border-white/10 overflow-hidden">
        <button
          type="button"
          onClick={() => setSmsExpanded((v) => !v)}
          className="w-full px-6 py-4 flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-slate-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Bank Alert Auto-Tracking</p>
              <p className="text-xs text-slate-500">Auto-log transactions from bank SMS</p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: smsExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-slate-500"
          >
            ▾
          </motion.div>
        </button>

        <motion.div
          initial={false}
          animate={{ height: smsExpanded ? "auto" : 0 }}
          transition={{ duration: 0.25 }}
          style={{ overflow: "hidden" }}
        >
          <div className="px-6 pb-6 border-t border-white/10 pt-4 space-y-4">
            <p className="text-sm text-slate-400 leading-relaxed">
              Allow TrackFlow to read your bank SMS alerts so we can automatically
              log debit and credit transactions — no manual entry needed.
            </p>

            <ul className="space-y-2">
              {SMS_BENEFITS.map(({ text }) => (
                <li key={text} className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-400 flex-shrink-0" />
                  <span className="text-xs text-slate-400">{text}</span>
                </li>
              ))}
            </ul>

            <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-xs text-slate-400 leading-relaxed">
              <strong className="text-slate-300">How it works:</strong> The app
              reads your incoming SMS notifications using the Android Notification
              Listener API. All processing happens on-device. We never see your
              messages.
            </div>

            <Button
              type="button"
              variant="outline"
              fullWidth
              className="border-slate-600 text-slate-300 hover:bg-slate-800/50"
            >
              Enable Auto-Tracking (Android)
            </Button>
            <p className="text-xs text-slate-600 text-center">
              Currently available on Android only. iOS support coming soon.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Final next button (shown if push is granted and user hasn't clicked Continue yet) */}
      {pushState !== "granted" && (
        <Button
          type="button"
          variant="brand"
          fullWidth
          size="lg"
          className="mt-4"
          onClick={handleNext}
        >
          Continue to Dashboard Setup
          <ArrowRight className="w-4 h-4" />
        </Button>
      )}
    </motion.div>
  );
}
