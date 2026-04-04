"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Briefcase, TrendingUp, TrendingDown, DollarSign,
  Package, Plus, Pencil, Trash2, X,
  ArrowUpRight, ArrowDownRight, Clock, CheckCircle2,
} from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { useAppStore } from "@/store/useAppStore";
import { useTransactions, useUpdateTransaction, DEFAULT_FILTERS } from "@/lib/hooks/useTransactions";
import { useInventory, useAddInventoryItem, useUpdateInventoryItem, useDeleteInventoryItem } from "@/lib/hooks/useInventory";
import { AppButton } from "@/components/ui/AppButton";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { formatNaira, getCategoryMeta, cn } from "@/lib/utils";
import type { InventoryItem, Transaction } from "@/types";

// ─── Tooltip style ────────────────────────────────────────────────────────────
const TOOLTIP_STYLE = {
  contentStyle: { background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, fontSize: 12 },
  labelStyle:   { color: "#94a3b8" },
  itemStyle:    { color: "#e2e8f0" },
};

// ─── Inventory form schema ────────────────────────────────────────────────────
const inventorySchema = z.object({
  name:                z.string().min(1, "Name is required").max(80),
  quantity:            z.number({ message: "Required" }).int().min(0),
  cost_price:          z.number({ message: "Required" }).min(0),
  selling_price:       z.number({ message: "Required" }).min(0),
  low_stock_threshold: z.number({ message: "Required" }).int().min(0),
});
type InventoryFormValues = z.infer<typeof inventorySchema>;

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BusinessPage() {
  const profile    = useAppStore((s) => s.profile);
  const [tab, setTab] = useState<"overview" | "analytics" | "inventory" | "reports">("overview");

  const { data: pages }  = useTransactions({ ...DEFAULT_FILTERS, context: "business", dateRange: "month" });
  const txThisMonth      = useMemo(() => pages?.pages.flat() ?? [], [pages]);

  const { data: pages6m } = useTransactions({ ...DEFAULT_FILTERS, context: "business", dateRange: "all" });
  const allTx             = useMemo(() => pages6m?.pages.flat() ?? [], [pages6m]);

  const { data: inventoryItems = [] } = useInventory();

  const revenue  = txThisMonth.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const expenses = txThisMonth.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
  const profit   = revenue - expenses;

  const lowStock = inventoryItems.filter(i => i.quantity <= i.low_stock_threshold);

  if (!profile) return null;

  if (profile.account_type !== "business") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 px-4 text-center">
        <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-600" />
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Business module not available</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">This section is only for Business accounts.</p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Briefcase className="w-5 h-5 text-gold-500" />
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {profile.business_name ?? "My Business"}
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gradient-gold text-navy">
              Business
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track revenue, expenses, and inventory
          </p>
        </div>
        <AppButton onClick={() => useAppStore.getState().setAddTransactionOpen(true)} size="md">
          <Plus className="w-4 h-4" /> Add Transaction
        </AppButton>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap">
        {(["overview", "analytics", "inventory", "reports"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize",
              tab === t
                ? "bg-brand-500 text-white"
                : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "overview"  && <OverviewTab revenue={revenue} expenses={expenses} profit={profit} txThisMonth={txThisMonth} />}
      {tab === "analytics" && <AnalyticsTab allTx={allTx} />}
      {tab === "inventory" && <InventoryTab items={inventoryItems} lowStock={lowStock} />}
      {tab === "reports"   && <ReportsTab allTx={allTx} />}
    </div>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────────
function OverviewTab({ revenue, expenses, profit, txThisMonth }: {
  revenue: number; expenses: number; profit: number; txThisMonth: Transaction[];
}) {
  const isProfit = profit >= 0;

  const { data: outstandingPages } = useTransactions({
    ...DEFAULT_FILTERS,
    context:       "business",
    type:          "income",
    paymentMethod: "outstanding",
    dateRange:     "all",
  });
  const outstandingTx = useMemo(() => outstandingPages?.pages.flat() ?? [], [outstandingPages]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard label="Revenue This Month" value={revenue} icon={<TrendingUp className="w-5 h-5 text-white/80" />} gradient="bg-gradient-success" />
        <KPICard label="Expenses This Month" value={expenses} icon={<TrendingDown className="w-5 h-5 text-white/80" />} gradient="bg-gradient-danger" />
        <KPICard label="Net Profit" value={Math.abs(profit)} icon={<DollarSign className="w-5 h-5 text-white/80" />}
          gradient={isProfit ? "bg-gradient-brand" : "bg-gradient-danger"} prefix={isProfit ? "+" : "−"} />
      </div>

      <div className={cn(
        "rounded-2xl p-4 flex items-center gap-3 border",
        isProfit
          ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
          : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
      )}>
        {isProfit
          ? <ArrowUpRight className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
          : <ArrowDownRight className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0" />
        }
        <div>
          <p className={cn("font-semibold text-sm", isProfit ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300")}>
            {isProfit ? "Profitable month" : "Loss this month"}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {revenue > 0 ? `Profit margin: ${((profit / revenue) * 100).toFixed(1)}%` : "No business revenue recorded yet"}
          </p>
        </div>
      </div>

      <OutstandingCard transactions={outstandingTx} />

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-5">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">Recent Business Transactions</h3>
        {txThisMonth.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">
            No business transactions this month. Use the &quot;Add to Business Account&quot; toggle when adding transactions.
          </p>
        ) : (
          <div className="space-y-1">
            {txThisMonth.slice(0, 10).map(tx => {
              const meta = getCategoryMeta(tx.category);
              return (
                <div key={tx.id} className="flex items-center gap-3 py-2.5 border-b border-slate-100 dark:border-slate-700 last:border-0">
                  <span className="text-xl shrink-0">{meta.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{tx.description}</p>
                    <p className="text-xs text-slate-500">{meta.label} · {tx.date}</p>
                  </div>
                  <p className={cn("text-sm font-semibold tabular-nums shrink-0", tx.type === "income" ? "text-emerald-500" : "text-red-400")}>
                    {tx.type === "income" ? "+" : "−"}{formatNaira(Number(tx.amount))}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── OutstandingCard ──────────────────────────────────────────────────────────
function OutstandingCard({ transactions }: { transactions: Transaction[] }) {
  const updateTx = useUpdateTransaction();

  const totalOutstanding = transactions.reduce((s, t) => s + Number(t.amount), 0);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Outstanding Payments</h3>
          {transactions.length > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300">
              {transactions.length}
            </span>
          )}
        </div>
        {transactions.length > 0 && (
          <span className="text-sm font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
            {formatNaira(totalOutstanding)}
          </span>
        )}
      </div>

      {transactions.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-4">
          No outstanding payments.{" "}
          <span className="text-slate-500">
            Tag a business income transaction as &ldquo;outstanding&rdquo; to track it here.
          </span>
        </p>
      ) : (
        <div className="space-y-1">
          {transactions.map(tx => {
            const meta = getCategoryMeta(tx.category);
            return (
              <div key={tx.id} className="flex items-center gap-3 py-2.5 border-b border-slate-100 dark:border-slate-700 last:border-0">
                <span className="text-xl shrink-0">{meta.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{tx.description}</p>
                  <p className="text-xs text-slate-500">{meta.label} · {tx.date}</p>
                </div>
                <p className="text-sm font-semibold tabular-nums text-emerald-500 shrink-0">
                  +{formatNaira(Number(tx.amount))}
                </p>
                <button
                  onClick={() => updateTx.mutate({
                    id:   tx.id,
                    data: { tags: (tx.tags ?? []).filter((tag: string) => tag !== "outstanding") },
                  })}
                  disabled={updateTx.isPending}
                  className="shrink-0 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 disabled:opacity-50 transition-colors px-2 py-1 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                  title="Mark as paid"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Paid
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function KPICard({ label, value, icon, gradient, prefix = "" }: {
  label: string; value: number; icon: React.ReactNode; gradient: string; prefix?: string;
}) {
  return (
    <div className={cn("rounded-2xl p-5 text-white shadow-card-lg relative overflow-hidden", gradient)}>
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">{icon}</div>
          <p className="text-xs text-white/75 font-medium">{label}</p>
        </div>
        <p className="text-2xl lg:text-3xl font-bold font-mono tracking-tight">
          {prefix}{formatNaira(value)}
        </p>
      </div>
    </div>
  );
}

// ─── Analytics ────────────────────────────────────────────────────────────────
function AnalyticsTab({ allTx }: { allTx: Transaction[] }) {
  const monthlyData = useMemo(() => (
    Array.from({ length: 6 }, (_, i) => {
      const d      = subMonths(new Date(), 5 - i);
      const start  = format(startOfMonth(d), "yyyy-MM-dd");
      const end    = format(endOfMonth(d), "yyyy-MM-dd");
      const rows   = allTx.filter(t => t.date >= start && t.date <= end);
      return {
        label:   format(d, "MMM"),
        income:  rows.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0),
        expense: rows.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0),
      };
    })
  ), [allTx]);

  const topCategories = useMemo(() => {
    const map = new Map<string, number>();
    allTx.filter(t => t.type === "expense").forEach(t => {
      map.set(t.category, (map.get(t.category) ?? 0) + Number(t.amount));
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6)
      .map(([cat, total]) => ({ name: getCategoryMeta(cat).label, total }));
  }, [allTx]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-5">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">Cash Flow — Last 6 Months</h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="bizIncGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="bizExpGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} />
            <YAxis tickFormatter={v => formatNaira(v, { compact: true })} tick={{ fontSize: 11, fill: "#64748b" }} width={60} />
            <Tooltip formatter={(v) => formatNaira(Number(v ?? 0))} {...TOOLTIP_STYLE} />
            <Area type="monotone" dataKey="income"  stroke="#22c55e" fill="url(#bizIncGrad)" strokeWidth={2} name="Revenue"  />
            <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="url(#bizExpGrad)" strokeWidth={2} name="Expenses" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {topCategories.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-5">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">Top Expense Categories</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topCategories} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" tickFormatter={v => formatNaira(v, { compact: true })} tick={{ fontSize: 10, fill: "#64748b" }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} width={100} />
              <Tooltip formatter={(v) => formatNaira(Number(v ?? 0))} {...TOOLTIP_STYLE} />
              <Bar dataKey="total" fill="#1a4ff5" radius={[0, 4, 4, 0]} name="Amount" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ─── Inventory ────────────────────────────────────────────────────────────────
function InventoryTab({ items, lowStock }: { items: InventoryItem[]; lowStock: InventoryItem[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState<InventoryItem | null>(null);

  const addItem    = useAddInventoryItem();
  const updateItem = useUpdateInventoryItem();
  const deleteItem = useDeleteInventoryItem();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<InventoryFormValues>({
    resolver: zodResolver(inventorySchema),
    defaultValues: { name: "", quantity: 0, cost_price: 0, selling_price: 0, low_stock_threshold: 5 },
  });

  function openAdd() {
    setEditing(null);
    reset({ name: "", quantity: 0, cost_price: 0, selling_price: 0, low_stock_threshold: 5 });
    setModalOpen(true);
  }

  function openEdit(item: InventoryItem) {
    setEditing(item);
    reset({
      name: item.name, quantity: item.quantity,
      cost_price: Number(item.cost_price), selling_price: Number(item.selling_price),
      low_stock_threshold: item.low_stock_threshold,
    });
    setModalOpen(true);
  }

  async function onSubmit(data: InventoryFormValues) {
    if (editing) {
      await updateItem.mutateAsync({ id: editing.id, data });
    } else {
      await addItem.mutateAsync(data);
    }
    setModalOpen(false);
    reset();
  }

  return (
    <div className="space-y-4">
      {lowStock.length > 0 && (
        <Alert variant="warning" title={`${lowStock.length} item${lowStock.length > 1 ? "s" : ""} low on stock`}>
          {lowStock.map(i => i.name).join(", ")}
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          Inventory ({items.length} items)
        </h3>
        <AppButton size="sm" onClick={openAdd}>
          <Plus className="w-3.5 h-3.5" /> Add Item
        </AppButton>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No inventory items yet</p>
          <p className="text-xs mt-1">Add products to track stock and margins</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map(item => {
            const margin = item.selling_price > 0
              ? ((Number(item.selling_price) - Number(item.cost_price)) / Number(item.selling_price)) * 100
              : 0;
            const isLow = item.quantity <= item.low_stock_threshold;
            return (
              <div key={item.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 leading-tight">{item.name}</p>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0",
                    isLow
                      ? "bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400"
                      : "bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400"
                  )}>
                    {isLow ? "Low Stock" : "In Stock"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><p className="text-slate-500">Qty</p><p className="font-semibold text-slate-800 dark:text-slate-100">{item.quantity}</p></div>
                  <div><p className="text-slate-500">Margin</p><p className="font-semibold text-emerald-600 dark:text-emerald-400">{margin.toFixed(1)}%</p></div>
                  <div><p className="text-slate-500">Cost</p><p className="font-medium text-slate-700 dark:text-slate-300">{formatNaira(Number(item.cost_price))}</p></div>
                  <div><p className="text-slate-500">Selling</p><p className="font-medium text-slate-700 dark:text-slate-300">{formatNaira(Number(item.selling_price))}</p></div>
                </div>
                <div className="flex gap-2 pt-1 border-t border-slate-100 dark:border-slate-700">
                  <button onClick={() => openEdit(item)} className="flex-1 text-xs text-slate-500 hover:text-brand-600 flex items-center justify-center gap-1 py-1 transition-colors">
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => { if (confirm(`Delete "${item.name}"?`)) deleteItem.mutate(item.id); }}
                    className="flex-1 text-xs text-slate-500 hover:text-red-500 flex items-center justify-center gap-1 py-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">{editing ? "Edit Item" : "Add Inventory Item"}</h3>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input label="Product Name" placeholder="e.g. Rice (50kg bag)" error={errors.name?.message} {...register("name")} />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Quantity" type="number" min={0} error={errors.quantity?.message} {...register("quantity", { valueAsNumber: true })} />
                  <Input label="Low Stock Alert" type="number" min={0} error={errors.low_stock_threshold?.message} {...register("low_stock_threshold", { valueAsNumber: true })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Cost Price (₦)" type="number" min={0} step="0.01" error={errors.cost_price?.message} {...register("cost_price", { valueAsNumber: true })} />
                  <Input label="Selling Price (₦)" type="number" min={0} step="0.01" error={errors.selling_price?.message} {...register("selling_price", { valueAsNumber: true })} />
                </div>
                <div className="flex gap-3 pt-2">
                  <AppButton type="button" variant="outline" fullWidth onClick={() => setModalOpen(false)}>Cancel</AppButton>
                  <AppButton type="submit" variant="brand" fullWidth loading={isSubmitting}>{editing ? "Save Changes" : "Add Item"}</AppButton>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Reports ─────────────────────────────────────────────────────────────────
function ReportsTab({ allTx }: { allTx: Transaction[] }) {
  const monthly = useMemo(() => (
    Array.from({ length: 6 }, (_, i) => {
      const d      = subMonths(new Date(), 5 - i);
      const start  = format(startOfMonth(d), "yyyy-MM-dd");
      const end    = format(endOfMonth(d), "yyyy-MM-dd");
      const rows   = allTx.filter(t => t.date >= start && t.date <= end);
      const income  = rows.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
      const expense = rows.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
      return { month: format(d, "MMM yyyy"), income, expense, profit: income - expense };
    })
  ), [allTx]);

  const totalIncome  = allTx.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = allTx.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
  const totalProfit  = totalIncome - totalExpense;

  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    allTx.filter(t => t.type === "expense").forEach(t => {
      map.set(t.category, (map.get(t.category) ?? 0) + Number(t.amount));
    });
    const total = totalExpense || 1;
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8)
      .map(([cat, amt]) => ({ label: getCategoryMeta(cat).label, emoji: getCategoryMeta(cat).emoji, amount: amt, pct: (amt / total) * 100 }));
  }, [allTx, totalExpense]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-5">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">P&L Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700">
            <span className="text-sm text-slate-600 dark:text-slate-300">Total Revenue</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatNaira(totalIncome)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700">
            <span className="text-sm text-slate-600 dark:text-slate-300">Total Expenses</span>
            <span className="font-semibold text-red-500">−{formatNaira(totalExpense)}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Net Profit / Loss</span>
            <span className={cn("font-bold text-base", totalProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500")}>
              {totalProfit >= 0 ? "+" : "−"}{formatNaira(Math.abs(totalProfit))}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-5">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">Monthly Revenue Trend</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-slate-100 dark:border-slate-700">
                <th className="text-left py-2 font-medium">Month</th>
                <th className="text-right py-2 font-medium">Revenue</th>
                <th className="text-right py-2 font-medium">Expenses</th>
                <th className="text-right py-2 font-medium">Profit</th>
              </tr>
            </thead>
            <tbody>
              {monthly.map(row => (
                <tr key={row.month} className="border-b border-slate-50 dark:border-slate-700/50">
                  <td className="py-2.5 text-slate-700 dark:text-slate-300 font-medium">{row.month}</td>
                  <td className="py-2.5 text-right text-emerald-600 dark:text-emerald-400">{formatNaira(row.income)}</td>
                  <td className="py-2.5 text-right text-red-500">{formatNaira(row.expense)}</td>
                  <td className={cn("py-2.5 text-right font-semibold", row.profit >= 0 ? "text-brand-600 dark:text-brand-400" : "text-red-500")}>
                    {row.profit >= 0 ? "+" : "−"}{formatNaira(Math.abs(row.profit))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {categoryBreakdown.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-5">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">Expense Breakdown</h3>
          <div className="space-y-3">
            {categoryBreakdown.map(c => (
              <div key={c.label} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-700 dark:text-slate-300">{c.emoji} {c.label}</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {formatNaira(c.amount)} <span className="text-slate-400">({c.pct.toFixed(1)}%)</span>
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
