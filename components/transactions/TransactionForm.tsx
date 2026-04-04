"use client";

import { useState, useRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Search,
  Check,
  Upload,
  Camera,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import { useAppStore } from "@/store/useAppStore";
import { AppButton } from "@/components/ui/AppButton";
import { TRANSACTION_CATEGORIES, cn } from "@/lib/utils";
import type { Transaction } from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAYMENT_METHODS = [
  { value: "cash",     label: "Cash",     icon: "💵" },
  { value: "transfer", label: "Transfer", icon: "📲" },
  { value: "card",     label: "Card",     icon: "💳" },
  { value: "pos",      label: "POS",      icon: "🖥️" },
  { value: "ussd",     label: "USSD",     icon: "📞" },
] as const;

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  type: z.enum(["income", "expense", "transfer"]),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => {
      const n = parseFloat(v.replace(/[,\s]/g, ""));
      return !isNaN(n) && n > 0;
    }, "Amount must be greater than ₦0"),
  category:     z.string().min(1, "Please select a category"),
  description:  z.string().min(1, "Description is required").max(100, "Max 100 characters"),
  date: z
    .string()
    .min(1, "Date is required")
    .refine((v) => {
      const selected = new Date(v);
      const now = new Date();
      now.setHours(23, 59, 59, 999);
      return selected <= now;
    }, "Date cannot be in the future"),
  payment_method:     z.enum(["cash", "transfer", "card", "pos", "ussd"]).optional(),
  note:               z.string().max(300, "Max 300 characters").optional(),
  is_recurring:       z.boolean(),
  recurring_interval: z.enum(["daily", "weekly", "monthly"]).optional(),
  add_to_family:      z.boolean(),
  add_to_business:    z.boolean(),
});

type FormValues = z.infer<typeof schema>;

// ─── Edit mode helpers ────────────────────────────────────────────────────────

const VALID_PAYMENT_METHODS = ["cash", "card", "pos", "ussd", "transfer"] as const;
type PaymentMethodValue = typeof VALID_PAYMENT_METHODS[number];

function mapTransactionToForm(tx: Transaction): FormValues {
  const tags        = tx.tags ?? [];
  const isTransfer  = tags.includes("transfer") && tx.type === "expense";
  const paymentMethod = tags.find(
    (t) => VALID_PAYMENT_METHODS.includes(t as PaymentMethodValue) && !(isTransfer && t === "transfer")
  ) as FormValues["payment_method"];

  const amountStr = Number(tx.amount)
    .toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  return {
    type:               isTransfer ? "transfer" : (tx.type as "income" | "expense"),
    amount:             amountStr,
    category:           tx.category,
    description:        tx.description,
    date:               tx.date,
    payment_method:     paymentMethod,
    note:               tx.note ?? "",
    is_recurring:       tx.is_recurring ?? false,
    recurring_interval: (tx.recurring_interval as FormValues["recurring_interval"]) ?? undefined,
    add_to_family:      (tx as { context?: string }).context === "family" || tags.includes("family"),
    add_to_business:    (tx as { context?: string }).context === "business" || tags.includes("business"),
  };
}

// ─── Category Dropdown ────────────────────────────────────────────────────────

function CategoryDropdown({
  value,
  onChange,
  transactionType,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  transactionType: "income" | "expense" | "transfer";
  error?: string;
}) {
  const [open, setOpen]           = useState(false);
  const [search, setSearch]       = useState("");
  const [dropdownStyle, setDropdownStyle] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });
  const ref                       = useRef<HTMLDivElement>(null);
  const buttonRef                 = useRef<HTMLButtonElement>(null);

  const dbType = transactionType === "transfer" ? "expense" : transactionType;

  const filtered = Object.entries(TRANSACTION_CATEGORIES).filter(([, meta]) => {
    const typeMatch   = meta.type === dbType;
    const searchMatch = search === "" || meta.label.toLowerCase().includes(search.toLowerCase());
    return typeMatch && searchMatch;
  });

  const selected = value
    ? TRANSACTION_CATEGORIES[value as keyof typeof TRANSACTION_CATEGORIES]
    : null;

  function updatePosition() {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyle({ top: rect.bottom + 6, left: rect.left, width: rect.width });
    }
  }

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    function handleScrollOrResize() {
      if (open) updatePosition();
    }
    if (open) {
      document.addEventListener("mousedown", handleOutside);
      window.addEventListener("scroll", handleScrollOrResize, true);
      window.addEventListener("resize", handleScrollOrResize);
      return () => {
        document.removeEventListener("mousedown", handleOutside);
        window.removeEventListener("scroll", handleScrollOrResize, true);
        window.removeEventListener("resize", handleScrollOrResize);
      };
    }
  }, [open]);

  return (
    <div ref={ref} className="relative w-full">
      <label className="block text-sm font-medium text-slate-300 mb-1.5">
        Category <span className="text-red-400">*</span>
      </label>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next) updatePosition();
        }}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all",
          "bg-white/5 text-white",
          error
            ? "border-red-500"
            : open
            ? "border-brand-500/60"
            : "border-white/10 hover:border-white/20"
        )}
      >
        {selected ? (
          <span className="flex items-center gap-2.5">
            <span className="text-lg leading-none">{selected.emoji}</span>
            <span className="text-sm">{selected.label}</span>
          </span>
        ) : (
          <span className="text-slate-500 text-sm">Select a category…</span>
        )}
        <ChevronDown
          className={cn(
            "w-4 h-4 text-slate-400 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.12 }}
            style={{ top: dropdownStyle.top, left: dropdownStyle.left, width: dropdownStyle.width }}
            className="fixed z-[9999] bg-[#0D1B3E] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="p-2 border-b border-white/10">
              <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg">
                <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent text-sm text-white placeholder:text-slate-500 outline-none flex-1"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-52 overflow-y-auto p-1">
              {filtered.map(([key, meta]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    onChange(key);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                    value === key
                      ? "bg-brand-500/15 text-white"
                      : "hover:bg-white/5 text-slate-300"
                  )}
                >
                  <span className="text-lg leading-none">{meta.emoji}</span>
                  <span className="text-sm flex-1">{meta.label}</span>
                  {value === key && (
                    <Check className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                  )}
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-center text-slate-500 text-sm py-6">No categories found</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0",
        checked ? "bg-brand-500" : "bg-white/10"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200",
          checked && "translate-x-5"
        )}
      />
    </button>
  );
}

// ─── Form Content ─────────────────────────────────────────────────────────────

function TransactionFormContent({ onClose }: { onClose: () => void }) {
  const { user }            = useAuth();
  const queryClient         = useQueryClient();
  const initialType         = useAppStore((s) => s.initialTransactionType);
  const editTransaction     = useAppStore((s) => s.editTransaction);
  const setEditTransaction  = useAppStore((s) => s.setEditTransaction);
  const fileRef             = useRef<HTMLInputElement>(null);
  const prevTypeRef         = useRef<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [submitting, setSubmitting]   = useState(false);

  const todayStr    = new Date().toISOString().split("T")[0];
  const accountType = (user?.user_metadata?.account_type as string) ?? "individual";
  const isEditing   = !!editTransaction;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type:               initialType ?? "expense",
      amount:             "",
      category:           "",
      description:        "",
      date:               todayStr,
      payment_method:     undefined,
      note:               "",
      is_recurring:       false,
      recurring_interval: undefined,
      add_to_family:      false,
      add_to_business:    false,
    },
  });

  const watchType        = watch("type");
  const watchAmount      = watch("amount");
  const watchIsRecurring = watch("is_recurring");

  // Reset form when editTransaction changes (open for edit) or clears (open for new)
  useEffect(() => {
    if (editTransaction) {
      const values = mapTransactionToForm(editTransaction);
      prevTypeRef.current = values.type;
      reset(values);
      setReceiptFile(null);
    } else {
      prevTypeRef.current = initialType ?? "expense";
      reset({
        type:               initialType ?? "expense",
        amount:             "",
        category:           "",
        description:        "",
        date:               todayStr,
        payment_method:     undefined,
        note:               "",
        is_recurring:       false,
        recurring_interval: undefined,
        add_to_family:      false,
        add_to_business:    false,
      });
      setReceiptFile(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editTransaction?.id]);

  // Clear category only when user actively changes the type (not on reset)
  useEffect(() => {
    if (prevTypeRef.current !== null && prevTypeRef.current !== watchType) {
      setValue("category", "");
    }
    prevTypeRef.current = watchType;
  }, [watchType, setValue]);

  // Sync type when initialType changes (new transaction mode only)
  useEffect(() => {
    if (!editTransaction) {
      setValue("type", initialType ?? "expense");
    }
  }, [initialType, setValue, editTransaction]);

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw     = e.target.value.replace(/[^0-9.]/g, "");
    const parts   = raw.split(".");
    const integer = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const decimal = parts.length > 1 ? "." + parts[1].slice(0, 2) : "";
    setValue("amount", integer + decimal);
  }

  function handleClose() {
    setEditTransaction(null);
    onClose();
  }

  async function onSubmit(data: FormValues) {
    if (!user) return;
    setSubmitting(true);
    try {
      const supabase = createClient();
      const dbType   = data.type === "transfer" ? "expense" : data.type;
      const amount   = parseFloat(data.amount.replace(/,/g, ""));

      const tags: string[] = [];
      if (data.payment_method) tags.push(data.payment_method);
      if (data.type === "transfer") tags.push("transfer");
      if (data.add_to_family) tags.push("family");
      if (data.add_to_business) tags.push("business");

      const context = data.add_to_family ? "family" : data.add_to_business ? "business" : "personal";

      if (isEditing) {
        // ── Edit existing transaction ──────────────────────────────────────
        const { error: txErr } = await supabase
          .from("transactions")
          .update({
            type:               dbType,
            amount,
            category:           data.category,
            description:        data.description,
            date:               data.date,
            note:               data.note?.trim() || null,
            tags:               tags.length > 0 ? tags : null,
            context,
            is_recurring:       data.is_recurring,
            recurring_interval: data.is_recurring ? (data.recurring_interval ?? null) : null,
            updated_at:         new Date().toISOString(),
          })
          .eq("id", editTransaction!.id)
          .eq("user_id", user.id);

        if (txErr) throw txErr;

        queryClient.invalidateQueries({ queryKey: ["transactions"] });
        queryClient.invalidateQueries({ queryKey: ["transaction-stats"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard-transactions"] });
        queryClient.invalidateQueries({ queryKey: ["budgets"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });

        const meta = TRANSACTION_CATEGORIES[data.category as keyof typeof TRANSACTION_CATEGORIES];
        toast.success("Transaction updated", {
          description: `${meta?.emoji ?? ""} ${meta?.label ?? data.category} · ₦${amount.toLocaleString("en-NG")}`,
        });
      } else {
        // ── Add new transaction ────────────────────────────────────────────
        let receipt_url: string | null = null;
        if (receiptFile) {
          const ext  = receiptFile.name.split(".").pop() ?? "jpg";
          const path = `${user.id}/${Date.now()}.${ext}`;
          const { data: up, error: upErr } = await supabase.storage
            .from("receipts")
            .upload(path, receiptFile);
          if (!upErr && up) {
            const { data: { publicUrl } } = supabase.storage
              .from("receipts")
              .getPublicUrl(up.path);
            receipt_url = publicUrl;
          }
        }

        const { error: txErr } = await supabase.from("transactions").insert({
          user_id:            user.id,
          type:               dbType,
          amount,
          category:           data.category,
          description:        data.description,
          date:               data.date,
          note:               data.note?.trim() || null,
          tags:               tags.length > 0 ? tags : null,
          receipt_url,
          context,
          is_recurring:       data.is_recurring,
          recurring_interval: data.is_recurring ? (data.recurring_interval ?? null) : null,
        });

        if (txErr) throw txErr;

        // Update matching active budget's spent
        if (dbType === "expense") {
          const { data: budgets } = await supabase
            .from("budgets")
            .select("id, spent")
            .eq("user_id", user.id)
            .eq("category", data.category)
            .eq("is_active", true)
            .lte("start_date", data.date)
            .gte("end_date", data.date)
            .limit(1);

          if (budgets && budgets.length > 0) {
            await supabase
              .from("budgets")
              .update({ spent: Number(budgets[0].spent) + amount })
              .eq("id", budgets[0].id);
          }
        }

        queryClient.invalidateQueries({ queryKey: ["dashboard-transactions"] });
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
        queryClient.invalidateQueries({ queryKey: ["budgets"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });

        const meta = TRANSACTION_CATEGORIES[data.category as keyof typeof TRANSACTION_CATEGORIES];
        toast.success(
          `${data.type === "income" ? "Income" : data.type === "transfer" ? "Transfer" : "Expense"} saved`,
          { description: `${meta?.emoji ?? ""} ${meta?.label ?? data.category} · ₦${amount.toLocaleString("en-NG")}` }
        );
      }

      reset();
      setReceiptFile(null);
      handleClose();
    } catch (err) {
      const description =
        err != null && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : err instanceof Error
          ? err.message
          : "Something went wrong";
      toast.error("Failed to save", { description });
    } finally {
      setSubmitting(false);
    }
  }

  const typeConfig = [
    { value: "income"   as const, label: "Income",   Icon: TrendingUp,     activeColor: "text-emerald-400", activeBg: "bg-emerald-500/15 border border-emerald-500/20" },
    { value: "expense"  as const, label: "Expense",  Icon: TrendingDown,   activeColor: "text-red-400",     activeBg: "bg-red-500/15 border border-red-500/20"         },
    { value: "transfer" as const, label: "Transfer", Icon: ArrowLeftRight, activeColor: "text-blue-400",    activeBg: "bg-blue-500/15 border border-blue-500/20"       },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 px-5 pb-10 pt-2">

      {/* Type Toggle */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-2xl">
        {typeConfig.map(({ value, label, Icon, activeColor, activeBg }) => (
          <button
            key={value}
            type="button"
            onClick={() => setValue("type", value)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
              watchType === value ? cn(activeBg, "text-white") : "text-slate-500 hover:text-slate-300"
            )}
          >
            <Icon className={cn("w-3.5 h-3.5", watchType === value ? activeColor : "")} />
            {label}
          </button>
        ))}
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Amount <span className="text-red-400">*</span>
        </label>
        <div
          className={cn(
            "flex items-stretch rounded-xl border overflow-hidden transition-all",
            errors.amount ? "border-red-500" : "border-white/10 focus-within:border-brand-500/50"
          )}
        >
          <div className="flex items-center px-4 bg-white/5 border-r border-white/10 select-none">
            <span className="text-2xl font-mono font-semibold text-slate-400">₦</span>
          </div>
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={watchAmount}
            onChange={handleAmountChange}
            className="flex-1 bg-white/5 px-4 py-4 text-2xl font-mono font-bold text-white placeholder:text-slate-700 outline-none"
          />
        </div>
        {errors.amount && (
          <p className="mt-1.5 text-xs text-red-400">{errors.amount.message}</p>
        )}
      </div>

      {/* Category */}
      <Controller
        name="category"
        control={control}
        render={({ field }) => (
          <CategoryDropdown
            value={field.value}
            onChange={field.onChange}
            transactionType={watchType}
            error={errors.category?.message}
          />
        )}
      />

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Description <span className="text-red-400">*</span>
        </label>
        <input
          {...register("description")}
          type="text"
          placeholder="e.g. Monthly rent, UBA salary credit…"
          className={cn(
            "w-full px-4 py-3 rounded-xl border bg-white/5 text-white text-sm placeholder:text-slate-600 outline-none transition-all",
            errors.description ? "border-red-500" : "border-white/10 focus:border-brand-500/50"
          )}
        />
        {errors.description && (
          <p className="mt-1.5 text-xs text-red-400">{errors.description.message}</p>
        )}
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Date <span className="text-red-400">*</span>
        </label>
        <input
          {...register("date")}
          type="date"
          max={todayStr}
          className={cn(
            "w-full px-4 py-3 rounded-xl border bg-white/5 text-white text-sm outline-none transition-all [color-scheme:dark]",
            errors.date ? "border-red-500" : "border-white/10 focus:border-brand-500/50"
          )}
        />
        {errors.date && (
          <p className="mt-1.5 text-xs text-red-400">{errors.date.message}</p>
        )}
      </div>

      {/* Payment Method */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Payment Method</label>
        <Controller
          name="payment_method"
          control={control}
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {PAYMENT_METHODS.map(({ value, label, icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => field.onChange(field.value === value ? undefined : value)}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-medium transition-all",
                    field.value === value
                      ? "bg-brand-500/20 border-brand-500/50 text-brand-300"
                      : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200"
                  )}
                >
                  <span className="text-base leading-none">{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          )}
        />
      </div>

      {/* Receipt Upload (add mode only) */}
      {!isEditing && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Receipt <span className="text-slate-500 text-xs font-normal">(optional)</span>
          </label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className={cn(
              "w-full flex items-center gap-2 px-4 py-3 rounded-xl border text-sm transition-all",
              receiptFile
                ? "bg-brand-500/10 border-brand-500/30 text-brand-300 justify-between"
                : "bg-white/5 border-white/10 border-dashed text-slate-500 hover:border-white/20 hover:text-slate-300 justify-center"
            )}
          >
            {receiptFile ? (
              <>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span className="truncate max-w-[200px] text-sm">{receiptFile.name}</span>
                </div>
                <span
                  role="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setReceiptFile(null);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </span>
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" />
                <Upload className="w-4 h-4" />
                Camera or upload photo
              </>
            )}
          </button>
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Notes <span className="text-slate-500 text-xs font-normal">(optional)</span>
        </label>
        <textarea
          {...register("note")}
          rows={2}
          placeholder="Any additional details…"
          className="w-full px-4 py-3 rounded-xl border bg-white/5 text-white text-sm placeholder:text-slate-600 outline-none transition-all border-white/10 focus:border-brand-500/50 resize-none"
        />
        {errors.note && (
          <p className="mt-1.5 text-xs text-red-400">{errors.note.message}</p>
        )}
      </div>

      {/* Recurring */}
      <div className="space-y-2">
        <Controller
          name="is_recurring"
          control={control}
          render={({ field }) => (
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <RefreshCw className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Recurring?</p>
                  <p className="text-xs text-slate-500">Repeat this transaction</p>
                </div>
              </div>
              <Toggle checked={field.value} onChange={field.onChange} />
            </div>
          )}
        />

        <AnimatePresence>
          {watchIsRecurring && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <Controller
                name="recurring_interval"
                control={control}
                render={({ field }) => (
                  <div className="flex gap-2 pt-1">
                    {(["daily", "weekly", "monthly"] as const).map((interval) => (
                      <button
                        key={interval}
                        type="button"
                        onClick={() => field.onChange(interval)}
                        className={cn(
                          "flex-1 py-2.5 rounded-xl border text-sm font-medium capitalize transition-all",
                          field.value === interval
                            ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                            : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20"
                        )}
                      >
                        {interval}
                      </button>
                    ))}
                  </div>
                )}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Family / Business Toggles */}
      {accountType === "family" && (
        <Controller
          name="add_to_family"
          control={control}
          render={({ field }) => (
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
              <div>
                <p className="text-sm font-medium text-white">Add to Family Budget?</p>
                <p className="text-xs text-slate-500">Share with family members</p>
              </div>
              <Toggle checked={field.value} onChange={field.onChange} />
            </div>
          )}
        />
      )}

      {accountType === "business" && (
        <Controller
          name="add_to_business"
          control={control}
          render={({ field }) => (
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
              <div>
                <p className="text-sm font-medium text-white">Add to Business Account?</p>
                <p className="text-xs text-slate-500">Track as business transaction</p>
              </div>
              <Toggle checked={field.value} onChange={field.onChange} />
            </div>
          )}
        />
      )}

      {/* Submit */}
      <AppButton type="submit" variant="gold" size="lg" fullWidth loading={submitting} className="mt-1">
        {isEditing ? "Save Changes" : "Save Transaction"}
      </AppButton>
    </form>
  );
}

// ─── Sheet Wrapper ────────────────────────────────────────────────────────────

export function TransactionForm() {
  const {
    addTransactionOpen,
    setAddTransactionOpen,
    editTransaction,
    setEditTransaction,
  } = useAppStore();

  const isOpen = addTransactionOpen || !!editTransaction;

  function handleClose() {
    setAddTransactionOpen(false);
    setEditTransaction(null);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="tf-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Right-side drawer */}
          <motion.div
            key="tf-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[480px] bg-[#080F1E] border-l border-white/8 overflow-y-auto overscroll-contain shadow-2xl"
          >
            {/* Sticky header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-[#080F1E]/95 backdrop-blur-md border-b border-white/5">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                  {editTransaction ? "Edit" : "New"}
                </p>
                <p className="text-base font-bold text-white leading-tight">Transaction</p>
              </div>
              <button
                onClick={handleClose}
                className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center text-slate-400 hover:bg-white/15 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <TransactionFormContent onClose={handleClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
