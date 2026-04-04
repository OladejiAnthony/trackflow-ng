import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import DashboardHeader    from "@/components/dashboard/DashboardHeader";
import BalanceCard        from "@/components/dashboard/BalanceCard";
import QuickActions       from "@/components/dashboard/QuickActions";
import BudgetProgress     from "@/components/dashboard/BudgetProgress";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import MotivationQuote    from "@/components/dashboard/MotivationQuote";

export const metadata: Metadata = { title: "Dashboard" };

function pctChange(current: number, prev: number) {
  if (prev === 0) return current > 0 ? 100 : 0;
  return ((current - prev) / Math.abs(prev)) * 100;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let balanceInitial  = undefined;
  let budgetsInitial  = undefined;
  let txInitial       = undefined;

  if (user) {
    const now       = new Date();
    const thisStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    const thisEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
    const lastStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split("T")[0];

    const [
      { data: balanceTxns },
      { data: budgets },
      { data: recentTxns },
    ] = await Promise.all([
      supabase
        .from("transactions")
        .select("type, amount, date")
        .eq("user_id", user.id)
        .gte("date", lastStart)
        .lte("date", thisEnd),
      supabase
        .from("budgets")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(10),
    ]);

    // Compute balance stats for BalanceCard
    const all         = balanceTxns ?? [];
    const thisMonth   = all.filter(t => t.date >= thisStart);
    const lastMonth   = all.filter(t => t.date <  thisStart);
    const thisIncome  = thisMonth.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
    const thisExpense = thisMonth.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
    const lastIncome  = lastMonth.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
    const lastExpense = lastMonth.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);

    balanceInitial = {
      balance:       thisIncome - thisExpense,
      income:        thisIncome,
      expenses:      thisExpense,
      balanceChange: pctChange(thisIncome - thisExpense, lastIncome - lastExpense),
      incomeChange:  pctChange(thisIncome, lastIncome),
      expenseChange: pctChange(thisExpense, lastExpense),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    budgetsInitial = (budgets ?? []) as any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    txInitial      = (recentTxns ?? []) as any[];
  }

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-6xl mx-auto">
      <DashboardHeader />
      <BalanceCard initialData={balanceInitial} />
      <QuickActions />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BudgetProgress initialData={budgetsInitial} />
        <RecentTransactions initialData={txInitial} />
      </div>
      <MotivationQuote />
    </div>
  );
}
