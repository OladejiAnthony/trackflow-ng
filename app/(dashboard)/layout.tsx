import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import { TransactionForm } from "@/components/transactions/TransactionForm";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-slate-950">
      <Sidebar />
      <main className="lg:pl-[260px] min-h-screen pb-20 lg:pb-0">
        {children}
      </main>
      <BottomNav />
      <TransactionForm />
    </div>
  );
}
