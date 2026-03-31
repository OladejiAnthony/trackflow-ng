import type { Metadata } from "next";
import DashboardHeader      from "@/components/dashboard/DashboardHeader";
import BalanceCard          from "@/components/dashboard/BalanceCard";
import QuickActions         from "@/components/dashboard/QuickActions";
import BudgetProgress       from "@/components/dashboard/BudgetProgress";
import RecentTransactions   from "@/components/dashboard/RecentTransactions";
import MotivationQuote      from "@/components/dashboard/MotivationQuote";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-6xl mx-auto">
      <DashboardHeader />
      <BalanceCard />
      <QuickActions />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BudgetProgress />
        <RecentTransactions />
      </div>
      <MotivationQuote />
    </div>
  );
}
