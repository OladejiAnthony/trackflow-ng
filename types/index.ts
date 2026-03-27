export * from "./database";

// ─── App-level types ──────────────────────────────────────────────────────────

export type AccountType = "individual" | "family" | "business";
export type TransactionType = "income" | "expense";
export type BudgetPeriod = "weekly" | "monthly" | "yearly";
export type PlanType = "free" | "pro" | "business";

export interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  savingsRate: number;
  transactionCount: number;
  period: string;
}

export interface ChartDataPoint {
  date: string;
  income: number;
  expense: number;
}

export interface CategorySummary {
  category: string;
  total: number;
  count: number;
  percentage: number;
  color: string;
}

export interface BudgetWithProgress {
  id: string;
  name: string;
  category: string;
  amount: number;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
  color: string | null;
}

export interface GoalWithProgress {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  remaining: number;
  percentage: number;
  daysLeft: number;
  isCompleted: boolean;
  color: string | null;
  icon: string | null;
}

export interface AIInsight {
  type: "warning" | "tip" | "achievement" | "forecast";
  title: string;
  body: string;
  action?: string;
}

export interface FilterOptions {
  type?: TransactionType | "all";
  category?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
