"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import { useAuth } from "@/lib/hooks/useAuth";
import { useAppStore } from "@/store/useAppStore";

export function LogoutConfirmModal() {
  const router             = useRouter();
  const { signOut }        = useAuth();
  const logoutModalOpen    = useAppStore((s) => s.logoutModalOpen);
  const setLogoutModalOpen = useAppStore((s) => s.setLogoutModalOpen);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    await signOut();
    router.push("/login");
  }

  return (
    <AnimatePresence>
      {logoutModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="logout-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => !loading && setLogoutModalOpen(false)}
          />

          {/* Modal */}
          <motion.div
            key="logout-modal"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-sm p-6 pointer-events-auto">
              {/* Icon */}
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/40 mx-auto mb-4">
                <LogOut className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>

              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 text-center mb-1">
                Sign out?
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
                You&apos;ll need to log back in to access your account.
              </p>

              <div className="flex gap-3">
                <AppButton
                  variant="outline"
                  fullWidth
                  onClick={() => setLogoutModalOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </AppButton>
                <AppButton
                  variant="danger"
                  fullWidth
                  loading={loading}
                  onClick={handleConfirm}
                >
                  Sign Out
                </AppButton>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
