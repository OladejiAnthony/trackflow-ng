"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, Pencil, Trash2, TrendingUp, TrendingDown,
  Calendar, Tag, CreditCard, FileText, Clock,
  Check, X,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { AppButton } from "@/components/ui/AppButton";
import { useAppStore } from "@/store/useAppStore";
import { useDeleteTransaction } from "@/lib/hooks/useTransactions";
import { createClient } from "@/lib/supabase/client";
import { getCategoryMeta, formatNaira, cn } from "@/lib/utils";
import type { Transaction } from "@/types";

const PAYMENT_LABELS: Record<string, { label: string; emoji: string }> = {
  cash:     { label: "Cash",     emoji: "💵" },
  transfer: { label: "Transfer", emoji: "📲" },
  card:     { label: "Card",     emoji: "💳" },
  pos:      { label: "POS",      emoji: "🖥️" },
  ussd:     { label: "USSD",     emoji: "📞" },
};

export default function TransactionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id     = params?.id as string;

  const openEditTransaction = useAppStore((s) => s.openEditTransaction);
  const { mutate: deleteTransaction, isPending: isDeleting } = useDeleteTransaction();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading]         = useState(true);
  const [notFound, setNotFound]       = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function load() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", id)
        .single();
      if (error || !data) {
        setNotFound(true);
      } else {
        setTransaction(data as Transaction);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  function handleEdit() {
    if (transaction) openEditTransaction(transaction);
  }

  function handleDelete() {
    if (!transaction) return;
    deleteTransaction(transaction.id, {
      onSuccess: () => router.push("/transactions"),
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !transaction) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-slate-400">Transaction not found.</p>
        <AppButton variant="outline" onClick={() => router.push("/transactions")}>
          <ArrowLeft className="w-4 h-4" />
          Back to Transactions
        </AppButton>
      </div>
    );
  }

  const isIncome    = transaction.type === "income";
  const catMeta     = getCategoryMeta(transaction.category);
  const paymentTag  = (transaction.tags ?? []).find((t) => t in PAYMENT_LABELS);
  const paymentInfo = paymentTag ? PAYMENT_LABELS[paymentTag] : null;
  const dateLabel   = (() => {
    try { return format(parseISO(transaction.date), "EEEE, d MMMM yyyy"); }
    catch { return transaction.date; }
  })();
  const createdAt = (() => {
    try { return format(new Date(transaction.created_at), "d MMM yyyy, h:mm a"); }
    catch { return ""; }
  })();

  type DetailItem = { icon: React.ElementType; label: string; value: string; hidden?: boolean };

  const details: DetailItem[] = [
    { icon: Tag,        label: "Category",       value: `${catMeta.emoji} ${catMeta.label}` },
    { icon: FileText,   label: "Description",    value: transaction.description },
    { icon: CreditCard, label: "Payment method", value: paymentInfo ? `${paymentInfo.emoji} ${paymentInfo.label}` : "—", hidden: !paymentInfo },
    { icon: FileText,   label: "Note",           value: transaction.note ?? "", hidden: !transaction.note },
    { icon: Calendar,   label: "Date",           value: dateLabel },
    { icon: Clock,      label: "Added on",       value: createdAt, hidden: !createdAt },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-lg mx-auto px-4 py-6 space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-2">
          <AppButton variant="outline" size="sm" onClick={handleEdit}>
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </AppButton>
          {!confirmDelete ? (
            <AppButton
              variant="danger"
              size="sm"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </AppButton>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 mr-1">Sure?</span>
              <AppButton
                variant="danger"
                size="sm"
                loading={isDeleting}
                onClick={handleDelete}
              >
                <Check className="w-3.5 h-3.5" />
                Yes
              </AppButton>
              <AppButton
                variant="ghost"
                size="sm"
                onClick={() => setConfirmDelete(false)}
              >
                <X className="w-3.5 h-3.5" />
              </AppButton>
            </div>
          )}
        </div>
      </div>

      {/* Hero amount card */}
      <div className={cn(
        "glass rounded-3xl p-8 border text-center",
        isIncome ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"
      )}>
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            isIncome ? "bg-emerald-500/20" : "bg-red-500/20"
          )}>
            {isIncome
              ? <TrendingUp className="w-5 h-5 text-emerald-400" />
              : <TrendingDown className="w-5 h-5 text-red-400" />
            }
          </div>
          <span className={cn(
            "text-sm font-semibold px-3 py-1 rounded-full",
            isIncome ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
          )}>
            {isIncome ? "Income" : "Expense"}
          </span>
        </div>
        <p className={cn(
          "text-4xl font-bold font-display tracking-tight",
          isIncome ? "text-emerald-400" : "text-red-400"
        )}>
          {isIncome ? "+" : "-"}{formatNaira(Number(transaction.amount))}
        </p>
        <p className="text-slate-400 text-sm mt-2">{dateLabel}</p>
      </div>

      {/* Details card */}
      <div className="glass rounded-2xl border border-white/10 divide-y divide-white/5 overflow-hidden">
        {details
          .filter((d) => !d.hidden)
          .map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-4 px-5 py-4">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-slate-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                <p className="text-sm text-slate-200 break-words">{value}</p>
              </div>
            </div>
          ))}
      </div>
    </motion.div>
  );
}
