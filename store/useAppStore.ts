import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Profile, Transaction } from "@/types";

interface AppState {
  // User
  profile: Profile | null;
  setProfile: (profile: Profile | null) => void;

  // UI
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Theme
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;

  // Quick add transaction modal
  addTransactionOpen: boolean;
  setAddTransactionOpen: (open: boolean) => void;
  initialTransactionType: "income" | "expense";
  setInitialTransactionType: (type: "income" | "expense") => void;

  // Edit transaction
  editTransaction: Transaction | null;
  setEditTransaction: (t: Transaction | null) => void;
  openEditTransaction: (t: Transaction) => void;

  // Active month filter (ISO string of first day of month)
  activeMonth: string;
  setActiveMonth: (month: string) => void;
}

function getFirstDayOfCurrentMonth(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),

      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      theme: "light",
      setTheme: (theme) => set({ theme }),

      addTransactionOpen: false,
      setAddTransactionOpen: (open) => set({ addTransactionOpen: open }),
      initialTransactionType: "expense",
      setInitialTransactionType: (type) => set({ initialTransactionType: type }),

      editTransaction: null,
      setEditTransaction: (t) => set({ editTransaction: t }),
      openEditTransaction: (t) => set({ editTransaction: t, addTransactionOpen: true }),

      activeMonth: getFirstDayOfCurrentMonth(),
      setActiveMonth: (month) => set({ activeMonth: month }),
    }),
    {
      name: "trackflow-app",
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        activeMonth: state.activeMonth,
      }),
    }
  )
);
