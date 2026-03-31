"use client";

import { useCallback, useEffect, useState } from "react";
import { Lightbulb, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const QUOTES = [
  { text: "A budget is telling your money where to go instead of wondering where it went.", author: "Dave Ramsey" },
  { text: "Do not save what is left after spending; instead spend what is left after saving.", author: "Warren Buffett" },
  { text: "Financial freedom is available to those who learn about it and work for it.", author: "Robert Kiyosaki" },
  { text: "The goal isn't more money. The goal is living life on your terms.", author: "Chris Brogan" },
  { text: "Wealth is not about having a lot of money; it's about having a lot of options.", author: "Chris Rock" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "Every naira saved is a naira working for your future.", author: "TrackFlow" },
  { text: "It's not your salary that makes you rich, it's your spending habits.", author: "Charles A. Jaffe" },
  { text: "Beware of little expenses. A small leak will sink a great ship.", author: "Benjamin Franklin" },
  { text: "The secret to wealth is simple: find a way to do more for others than anyone else does.", author: "Tony Robbins" },
];

const AUTO_ROTATE_MS = 30_000;

export default function MotivationQuote() {
  const [index,    setIndex]    = useState(() => new Date().getDate() % QUOTES.length);
  const [spinning, setSpinning] = useState(false);
  const [visible,  setVisible]  = useState(true);

  const next = useCallback(() => {
    setVisible(false);
    setSpinning(true);
    setTimeout(() => {
      setIndex(i => (i + 1) % QUOTES.length);
      setVisible(true);
    }, 220);
    setTimeout(() => setSpinning(false), 500);
  }, []);

  // Auto-rotate every 30 s
  useEffect(() => {
    const id = setInterval(next, AUTO_ROTATE_MS);
    return () => clearInterval(id);
  }, [next]);

  const quote = QUOTES[index];

  return (
    <div className="rounded-2xl border border-gold-200 dark:border-gold-800/30 bg-gradient-to-br from-gold-50 to-amber-50/50 dark:from-gold-900/10 dark:to-amber-900/5 p-5">
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-xl bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center shrink-0 mt-0.5">
          <Lightbulb className="w-4 h-4 text-gold-600 dark:text-gold-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div
            className={cn(
              "transition-opacity duration-200",
              visible ? "opacity-100" : "opacity-0"
            )}
          >
            <p className="text-sm italic text-slate-600 dark:text-slate-300 leading-relaxed">
              &ldquo;{quote.text}&rdquo;
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 font-medium">
              — {quote.author}
            </p>
          </div>
        </div>

        <button
          onClick={next}
          aria-label="New quote"
          className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gold-100 dark:hover:bg-gold-900/30 transition-colors"
        >
          <RefreshCw className={cn("w-3.5 h-3.5 text-gold-500", spinning && "animate-spin")} />
        </button>
      </div>
    </div>
  );
}
