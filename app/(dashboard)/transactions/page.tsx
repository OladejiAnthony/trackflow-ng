"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import {
  Plus, Download, Search, ChevronDown, X,
  Pencil, Trash2, TrendingUp, TrendingDown,
  Check, Loader2, Receipt,
} from "lucide-react";
import { toast } from "sonner";
import { AppButton } from "@/components/ui/AppButton";
import { useAppStore } from "@/store/useAppStore";
import {
  useTransactions,
  useTransactionStats,
  useDeleteTransaction,
  useExportTransactions,
  type TransactionFilters,
  DEFAULT_FILTERS,
} from "@/lib/hooks/useTransactions";
import { TRANSACTION_CATEGORIES, formatNaira, cn } from "@/lib/utils";
import type { Transaction } from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const DATE_RANGE_OPTIONS = [
  { value: "today" as const, label: "Today" },
  { value: "week" as const, label: "This Week" },
  { value: "month" as const, label: "This Month" },
  { value: "all" as const, label: "All Time" },
  { value: "custom" as const, label: "Custom" },
] as const;

const TYPE_OPTIONS = [
  { value: "all" as const, label: "All" },
  { value: "income" as const, label: "Income" },
  { value: "expense" as const, label: "Expenses" },
] as const;

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash", emoji: "💵" },
  { value: "transfer", label: "Transfer", emoji: "📲" },
  { value: "card", label: "Card", emoji: "💳" },
  { value: "pos", label: "POS", emoji: "🖥️" },
  { value: "ussd", label: "USSD", emoji: "📞" },
];

// ─── CSV helpers ──────────────────────────────────────────────────────────────

const CSV_HEADERS = "Date,Type,Category,Description,Amount (₦),Payment Method,Note";

function txToCsvRow(t: Transaction): string {
  const pm = (t.tags ?? []).find((tag) =>
    ["cash", "transfer", "card", "pos", "ussd"].includes(tag)
  ) ?? "";
  const esc = (s: string) => `"${(s ?? "").replace(/"/g, '""')}"`;
  return [
    t.date,
    t.type,
    t.category,
    esc(t.description),
    Number(t.amount).toFixed(2),
    pm,
    esc(t.note ?? ""),
  ].join(",");
}

function downloadCsv(content: string, filename: string) {
  const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Date grouping helpers ────────────────────────────────────────────────────

function getDateLabel(dateStr: string): string {
  try {
    const d = parseISO(dateStr);
    if (isToday(d)) return "Today";
    if (isYesterday(d)) return "Yesterday";
    return format(d, "EEE, d MMM yyyy");
  } catch {
    return dateStr;
  }
}

function groupByDate(transactions: Transaction[]): [string, Transaction[]][] {
  const map = new Map<string, Transaction[]>();
  for (const t of transactions) {
    if (!map.has(t.date)) map.set(t.date, []);
    map.get(t.date)!.push(t);
  }
  return Array.from(map.entries());
}

// ─── CategoryMultiSelect ──────────────────────────────────────────────────────

function CategoryMultiSelect({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (
        !buttonRef.current?.contains(e.target as Node) &&
        !dropdownRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const allCategories = Object.entries(TRANSACTION_CATEGORIES);
  const label =
    selected.length === 0
      ? "Category"
      : selected.length === 1
        ? (TRANSACTION_CATEGORIES[selected[0] as keyof typeof TRANSACTION_CATEGORIES]?.label ?? selected[0])
        : `${selected.length} categories`;

  function toggle(key: string) {
    onChange(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]);
  }

  function handleOpen() {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 224),
        zIndex: 9999,
      });
    }
    setOpen((v) => !v);
  }

  return (
    <div className="relative flex-shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleOpen}
        className={cn(
          "flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium whitespace-nowrap transition-all",
          selected.length > 0
            ? "bg-brand-500/20 border-brand-500/40 text-brand-300"
            : "bg-white/5 border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300"
        )}
      >
        {label}
        <ChevronDown className={cn("w-3 h-3 transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={dropdownRef}
            style={dropdownStyle}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.12 }}
            className="bg-[#0D1B3E] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="p-1.5 max-h-64 overflow-y-auto">
              {allCategories.map(([key, meta]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggle(key)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-left transition-colors"
                >
                  <span className="text-base leading-none">{meta.emoji}</span>
                  <span className="text-sm text-slate-300 flex-1">{meta.label}</span>
                  {selected.includes(key) && (
                    <Check className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
            {selected.length > 0 && (
              <div className="border-t border-white/10 p-1.5">
                <button
                  type="button"
                  onClick={() => onChange([])}
                  className="w-full text-xs text-slate-500 hover:text-slate-300 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── SummaryBar ───────────────────────────────────────────────────────────────

function SummaryBar({
  income, expenses, net, isLoading,
}: {
  income: number; expenses: number; net: number; isLoading: boolean;
}) {
  const items = [
    {
      label: "Income",
      value: income,
      Icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Expenses",
      value: expenses,
      Icon: TrendingDown,
      color: "text-red-400",
      bg: "bg-red-500/10 border-red-500/20",
    },
    {
      label: "Net",
      value: net,
      Icon: net >= 0 ? TrendingUp : TrendingDown,
      color: net >= 0 ? "text-brand-400" : "text-red-400",
      bg: net >= 0 ? "bg-brand-500/10 border-brand-500/20" : "bg-red-500/10 border-red-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3 px-4 pb-4">
      {items.map(({ label, value, Icon, color, bg }) => (
        <div key={label} className={cn("rounded-2xl border p-3", bg)}>
          <div className="flex items-center gap-1 mb-1">
            <Icon className={cn("w-3 h-3", color)} />
            <span className="text-[10px] text-slate-500 font-medium">{label}</span>
          </div>
          {isLoading ? (
            <div className="h-4 w-16 rounded skeleton" />
          ) : (
            <p className={cn("text-xs sm:text-sm font-bold font-mono leading-tight", color)}>
              {formatNaira(value, { compact: Math.abs(value) >= 1_000_000 })}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── TransactionCard ──────────────────────────────────────────────────────────

function TransactionCard({
  transaction,
  onEdit,
  onDelete,
  isDeleting,
}: {
  transaction: Transaction;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const meta = TRANSACTION_CATEGORIES[transaction.category as keyof typeof TRANSACTION_CATEGORIES];
  const isIncome = transaction.type === "income";
  const tags = transaction.tags ?? [];
  const pmValue = tags.find((t) => ["cash", "transfer", "card", "pos", "ussd"].includes(t));
  const pm = PAYMENT_METHODS.find((p) => p.value === pmValue);
  const timeStr = transaction.created_at
    ? format(new Date(transaction.created_at), "h:mm a")
    : "";

  return (
    <div className="group relative flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.03] transition-colors border-b border-white/[0.04] last:border-0">
      {/* Category icon */}
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl"
        style={{ backgroundColor: meta?.color ? `${meta.color}22` : "#33415522" }}
      >
        {meta?.emoji ?? "💰"}
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-white truncate leading-snug">{transaction.description}</p>
          {pm && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white/8 text-[10px] text-slate-400 flex-shrink-0">
              <span>{pm.emoji}</span>
              {pm.label}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs text-slate-500">{meta?.label ?? transaction.category}</span>
          {timeStr && (
            <>
              <span className="text-slate-700 text-[10px]">·</span>
              <span className="text-[10px] text-slate-600">{timeStr}</span>
            </>
          )}
        </div>
      </div>

      {/* Amount + actions */}
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <p className={cn(
          "text-sm font-bold font-mono",
          isIncome ? "text-emerald-400" : "text-red-400"
        )}>
          {isIncome ? "+" : "−"}{formatNaira(Number(transaction.amount))}
        </p>

        <AnimatePresence mode="wait">
          {confirmDelete ? (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.1 }}
              className="flex items-center gap-1"
            >
              <span className="text-[10px] text-slate-400">Delete?</span>
              <button
                onClick={() => { onDelete(); setConfirmDelete(false); }}
                disabled={isDeleting}
                className="px-2 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors font-medium"
              >
                {isDeleting ? "…" : "Yes"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-2 py-0.5 rounded text-[10px] bg-white/8 text-slate-400 hover:bg-white/15 transition-colors"
              >
                No
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="actions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
            >
              <button
                onClick={onEdit}
                className="w-6 h-6 rounded-lg bg-white/8 flex items-center justify-center text-slate-400 hover:text-brand-300 hover:bg-brand-500/15 transition-all"
                aria-label="Edit transaction"
              >
                <Pencil className="w-3 h-3" />
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-6 h-6 rounded-lg bg-white/8 flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/15 transition-all"
                aria-label="Delete transaction"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TransactionsPage() {
  const [filters, setFilters] = useState<TransactionFilters>({ ...DEFAULT_FILTERS });
  const [searchInput, setSearchInput] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { setAddTransactionOpen, openEditTransaction } = useAppStore();

  const {
    data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage,
  } = useTransactions(filters);

  const { data: stats, isLoading: statsLoading } = useTransactionStats(filters);
  const { mutate: deleteTransaction, isPending: isDeleting } = useDeleteTransaction();
  const exportFn = useExportTransactions();

  // Debounced search
  useEffect(() => {
    const t = setTimeout(
      () => setFilters((f) => ({ ...f, search: searchInput })),
      300
    );
    return () => clearTimeout(t);
  }, [searchInput]);

  // Infinite scroll
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten + group by date
  const allTransactions = useMemo(() => data?.pages.flat() ?? [], [data]);
  const grouped = useMemo(() => groupByDate(allTransactions), [allTransactions]);

  async function handleExport() {
    setExporting(true);
    try {
      const rows = await exportFn(filters);
      const csv = [CSV_HEADERS, ...rows.map(txToCsvRow)].join("\n");
      downloadCsv(csv, `trackflow-${format(new Date(), "yyyy-MM-dd")}.csv`);
      toast.success(`Exported ${rows.length} transaction${rows.length !== 1 ? "s" : ""}`);
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  }

  function updateFilter<K extends keyof TransactionFilters>(key: K, value: TransactionFilters[K]) {
    setFilters((f) => ({ ...f, [key]: value }));
  }

  const activeFilterCount = [
    filters.type !== "all",
    filters.categories.length > 0,
    filters.paymentMethod !== null,
    filters.dateRange !== "month",
    filters.search.trim() !== "",
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen">

      {/* ── Sticky header + filters ─────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-[#080F1E]/92 backdrop-blur-md border-b border-white/5">

        {/* Title row */}
        <div className="flex items-center justify-between px-4 pt-5 pb-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">Transactions</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {allTransactions.length > 0
                ? `${allTransactions.length}${hasNextPage ? "+" : ""} records`
                : "All your money movements"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AppButton
              variant="outline"
              size="sm"
              loading={exporting}
              onClick={handleExport}
              className="border-white/10 text-slate-400 hover:text-white hidden sm:flex"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </AppButton>
            <AppButton
              variant="brand"
              size="sm"
              onClick={() => setAddTransactionOpen(true)}
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Transaction</span>
              <span className="sm:hidden">Add</span>
            </AppButton>
          </div>
        </div>

        {/* Filter row 1: date range + type pills */}
        <div className="flex items-center gap-2 px-4 pb-2 overflow-x-auto scrollbar-none">
          {DATE_RANGE_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => updateFilter("dateRange", value)}
              className={cn(
                "px-3 py-1.5 rounded-xl border text-xs font-medium whitespace-nowrap transition-all flex-shrink-0",
                filters.dateRange === value
                  ? "bg-brand-500/20 border-brand-500/40 text-brand-300"
                  : "bg-white/5 border-white/10 text-slate-500 hover:text-slate-300 hover:border-white/20"
              )}
            >
              {label}
            </button>
          ))}

          <div className="w-px h-4 bg-white/10 flex-shrink-0" />

          {TYPE_OPTIONS.map(({ value, label }) => {
            const activeClass =
              value === "income" ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" :
                value === "expense" ? "bg-red-500/20 border-red-500/40 text-red-300" :
                  "bg-brand-500/20 border-brand-500/40 text-brand-300";
            return (
              <button
                key={value}
                type="button"
                onClick={() => updateFilter("type", value)}
                className={cn(
                  "px-3 py-1.5 rounded-xl border text-xs font-medium whitespace-nowrap transition-all flex-shrink-0",
                  filters.type === value
                    ? activeClass
                    : "bg-white/5 border-white/10 text-slate-500 hover:text-slate-300 hover:border-white/20"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Custom date range inputs */}
        <AnimatePresence>
          {filters.dateRange === "custom" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-2 px-4 pb-2">
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => updateFilter("startDate", e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white outline-none focus:border-brand-500/50 [color-scheme:dark]"
                />
                <span className="text-slate-600 text-sm">→</span>
                <input
                  type="date"
                  value={filters.endDate}
                  min={filters.startDate}
                  onChange={(e) => updateFilter("endDate", e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white outline-none focus:border-brand-500/50 [color-scheme:dark]"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter row 2: search + category + payment method + clear */}
        <div className="flex items-center gap-2 px-4 pb-3 overflow-x-auto scrollbar-none">
          {/* Search */}
          <div className="relative flex-1 min-w-[120px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-brand-500/50 transition-colors"
            />
            {searchInput && (
              <button
                onClick={() => { setSearchInput(""); setFilters((f) => ({ ...f, search: "" })); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category multi-select */}
          <CategoryMultiSelect
            selected={filters.categories}
            onChange={(v) => updateFilter("categories", v)}
          />

          {/* Payment method */}
          <select
            value={filters.paymentMethod ?? ""}
            onChange={(e) => updateFilter("paymentMethod", e.target.value || null)}
            className="flex-shrink-0 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs text-slate-500 outline-none focus:border-brand-500/50 [color-scheme:dark] cursor-pointer"
          >
            <option value="">Payment</option>
            {PAYMENT_METHODS.map(({ value, label, emoji }) => (
              <option key={value} value={value}>{emoji} {label}</option>
            ))}
          </select>

          {/* Clear filters */}
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={() => { setFilters({ ...DEFAULT_FILTERS }); setSearchInput(""); }}
              className="flex-shrink-0 flex items-center gap-1 px-2.5 py-2 rounded-xl border border-white/10 bg-white/5 text-xs text-slate-500 hover:text-white hover:border-white/20 transition-all"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Summary bar ─────────────────────────────────────────────────────── */}
      <div className="pt-4">
        <SummaryBar
          income={stats?.totalIncome ?? 0}
          expenses={stats?.totalExpenses ?? 0}
          net={stats?.netBalance ?? 0}
          isLoading={statsLoading}
        />
      </div>

      {/* ── Transaction list ─────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-brand-400 animate-spin" />
        </div>
      ) : grouped.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center mb-4">
            <Receipt className="w-7 h-7 text-slate-600" />
          </div>
          <p className="text-base font-semibold text-white mb-1.5">No transactions found</p>
          <p className="text-sm text-slate-500 mb-6 max-w-xs">
            {activeFilterCount > 0
              ? "Try adjusting your filters to see more results"
              : "Start recording your income and expenses"}
          </p>
          {activeFilterCount > 0 ? (
            <AppButton
              variant="outline"
              size="sm"
              onClick={() => { setFilters({ ...DEFAULT_FILTERS }); setSearchInput(""); }}
              className="border-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
              Clear Filters
            </AppButton>
          ) : (
            <AppButton variant="brand" size="sm" onClick={() => setAddTransactionOpen(true)}>
              <Plus className="w-3.5 h-3.5" />
              Add First Transaction
            </AppButton>
          )}
        </div>
      ) : (
        <div className="pb-8">
          {grouped.map(([dateStr, txns]) => (
            <div key={dateStr}>
              {/* Sticky date header */}
              <div className="sticky top-[168px] z-10 flex items-center gap-3 px-4 py-2 bg-[#080F1E]/85 backdrop-blur-sm">
                <span className="text-xs font-semibold text-slate-400">{getDateLabel(dateStr)}</span>
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-[10px] text-slate-600">
                  {txns.length} {txns.length === 1 ? "entry" : "entries"}
                </span>
              </div>

              {/* Cards */}
              <AnimatePresence>
                {txns.map((tx) => (
                  <motion.div
                    key={tx.id}
                    layout
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4, transition: { duration: 0.15 } }}
                  >
                    <TransactionCard
                      transaction={tx}
                      isDeleting={isDeleting && deletingId === tx.id}
                      onEdit={() => openEditTransaction(tx)}
                      onDelete={() => {
                        setDeletingId(tx.id);
                        deleteTransaction(tx.id, {
                          onSettled: () => setDeletingId(null),
                        });
                      }}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ))}

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="flex justify-center py-4">
            {isFetchingNextPage && (
              <Loader2 className="w-5 h-5 text-brand-400 animate-spin" />
            )}
          </div>
        </div>
      )}

      {/* Mobile export FAB */}
      <button
        onClick={handleExport}
        disabled={exporting}
        className="fixed bottom-24 right-4 sm:hidden w-10 h-10 rounded-full bg-[#0D1B3E] border border-white/15 flex items-center justify-center text-slate-400 hover:text-white transition-all shadow-xl"
        aria-label="Export CSV"
      >
        {exporting
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <Download className="w-4 h-4" />}
      </button>
    </div>
  );
}
