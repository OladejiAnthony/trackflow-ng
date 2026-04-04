import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

// Required by shadcn
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Currency ────────────────────────────────────────────────────────────────

/**
 * Format a number as Nigerian Naira.
 * e.g. 1500000 → "₦1,500,000.00"
 */
export function formatNaira(
  amount: number,
  options: { compact?: boolean; decimals?: boolean } = {}
): string {
  const { compact = false, decimals = true } = options;

  if (compact) {
    if (Math.abs(amount) >= 1_000_000_000)
      return `₦${(amount / 1_000_000_000).toFixed(1)}B`;
    if (Math.abs(amount) >= 1_000_000)
      return `₦${(amount / 1_000_000).toFixed(1)}M`;
    if (Math.abs(amount) >= 1_000)
      return `₦${(amount / 1_000).toFixed(1)}K`;
  }

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals ? 2 : 0,
  }).format(amount);
}

/**
 * Parse a string Naira value (e.g. "₦1,500") to number (1500)
 */
export function parseNaira(value: string): number {
  return parseFloat(value.replace(/[₦,\s]/g, "")) || 0;
}

// ─── Date Helpers ─────────────────────────────────────────────────────────────

export function formatDate(date: string | Date, fmt = "dd MMM yyyy"): string {
  return format(new Date(date), fmt);
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), "dd MMM yyyy, h:mm a");
}

export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatMonth(date: string | Date): string {
  return format(new Date(date), "MMMM yyyy");
}

export function startOfCurrentMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export function endOfCurrentMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
}

// ─── Number Helpers ───────────────────────────────────────────────────────────

export function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}

export function percentage(part: number, total: number): number {
  if (total === 0) return 0;
  return clampPercent((part / total) * 100);
}

export function roundTo(value: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

// ─── String Helpers ───────────────────────────────────────────────────────────

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function truncate(str: string, length = 40): string {
  if (str.length <= length) return str;
  return str.slice(0, length).trimEnd() + "…";
}

export function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// ─── Color Helpers ────────────────────────────────────────────────────────────

/** Returns a deterministic color from a palette based on a string seed */
export function colorFromString(str: string): string {
  const colors = [
    "#1a4ff5", "#22c55e", "#f59e0b", "#ef4444",
    "#8b5cf6", "#06b6d4", "#ec4899", "#f97316",
    "#14b8a6", "#6366f1",
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// ─── Transaction Categories ───────────────────────────────────────────────────

export const TRANSACTION_CATEGORIES = {
  // Income
  salary:        { label: "Salary",         emoji: "💼", color: "#22c55e", type: "income"  },
  freelance:     { label: "Freelance",       emoji: "💻", color: "#16a34a", type: "income"  },
  business:      { label: "Business",        emoji: "🏢", color: "#15803d", type: "income"  },
  investment:    { label: "Investment",      emoji: "📈", color: "#14532d", type: "income"  },
  gift_received: { label: "Gift Received",   emoji: "🎁", color: "#4ade80", type: "income"  },
  other_income:  { label: "Other Income",    emoji: "💰", color: "#86efac", type: "income"  },
  // Expenses
  food:          { label: "Food & Dining",   emoji: "🍽️",  color: "#f97316", type: "expense" },
  transport:     { label: "Transport",       emoji: "🚗",  color: "#f59e0b", type: "expense" },
  utilities:     { label: "Utilities",       emoji: "💡",  color: "#eab308", type: "expense" },
  housing:       { label: "Housing",         emoji: "🏠",  color: "#84cc16", type: "expense" },
  health:        { label: "Health",          emoji: "🏥",  color: "#ef4444", type: "expense" },
  education:     { label: "Education",       emoji: "📚",  color: "#8b5cf6", type: "expense" },
  entertainment: { label: "Entertainment",   emoji: "🎬",  color: "#ec4899", type: "expense" },
  shopping:      { label: "Shopping",        emoji: "🛍️",  color: "#06b6d4", type: "expense" },
  savings:       { label: "Savings",         emoji: "🏦",  color: "#1a4ff5", type: "expense" },
  insurance:     { label: "Insurance",       emoji: "🛡️",  color: "#6366f1", type: "expense" },
  subscriptions: { label: "Subscriptions",   emoji: "📱",  color: "#14b8a6", type: "expense" },
  family:        { label: "Family",          emoji: "👨‍👩‍👧‍👦", color: "#f43f5e", type: "expense" },
  giving:        { label: "Giving",           emoji: "🙏",  color: "#a78bfa", type: "expense" },
  data:          { label: "Data/Airtime",    emoji: "📶",  color: "#38bdf8", type: "expense" },
  other_expense: { label: "Other Expense",   emoji: "💸",  color: "#94a3b8", type: "expense" },
  // Business income
  product_sales: { label: "Product Sales",   emoji: "📦",  color: "#22c55e", type: "income"  },
  service_fees:  { label: "Service Fees",    emoji: "🔧",  color: "#16a34a", type: "income"  },
  online_sales:  { label: "Online Sales",    emoji: "🛒",  color: "#15803d", type: "income"  },
  market_sales:  { label: "Market Sales",    emoji: "🏪",  color: "#166534", type: "income"  },
  // Business expenses
  inventory_stock: { label: "Inventory/Stock", emoji: "📋", color: "#ea580c", type: "expense" },
  staff_salary:  { label: "Staff Salary",    emoji: "👥",  color: "#dc2626", type: "expense" },
  delivery:      { label: "Delivery",        emoji: "🚚",  color: "#d97706", type: "expense" },
  marketing_ads: { label: "Marketing/Ads",   emoji: "📣",  color: "#7c3aed", type: "expense" },
  equipment:     { label: "Equipment",       emoji: "⚙️",  color: "#0891b2", type: "expense" },
} as const;

export type TransactionCategory = keyof typeof TRANSACTION_CATEGORIES;

export function getCategoryMeta(category: string) {
  return (
    TRANSACTION_CATEGORIES[category as TransactionCategory] ?? {
      label: capitalize(category),
      emoji: "💸",
      color: "#94a3b8",
      type: "expense",
    }
  );
}

// ─── Validation ───────────────────────────────────────────────────────────────

export function isValidNigerianPhone(phone: string): boolean {
  return /^(\+?234|0)[789]\d{9}$/.test(phone.replace(/\s/g, ""));
}

export function formatNigerianPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("234")) return `+${cleaned}`;
  if (cleaned.startsWith("0")) return `+234${cleaned.slice(1)}`;
  return `+234${cleaned}`;
}

// ─── Error handling ───────────────────────────────────────────────────────────

export function getErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred";
}
