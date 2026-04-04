"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";

export function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-md bg-[#0D1B3E]/85 border-b border-white/10 shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="shrink-0">
          <Image
            src="/assets/full_logo_dark.png"
            alt="TrackFlow"
            width={160}
            height={40}
            priority
            className="h-9 w-auto"
            style={{ filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.5))" }}
          />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {["Features", "Pricing", "About"].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-slate-300 hover:text-white text-sm font-medium transition-colors duration-150"
            >
              {link}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-slate-300 hover:text-white text-sm font-semibold px-4 py-2 rounded-xl border border-white/20 hover:border-white/40 transition-all duration-150"
          >
            Login
          </Link>
          <AppButton variant="gold" size="sm" onClick={() => (window.location.href = "/register")}>
            Get Started Free
          </AppButton>
        </div>

        <button
          className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden overflow-hidden border-t border-white/10 backdrop-blur-md bg-[#0D1B3E]/95"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {["Features", "Pricing", "About"].map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  className="text-slate-300 hover:text-white text-sm font-medium py-2 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                <Link href="/login" className="btn-outline text-center py-2.5 text-sm">
                  Login
                </Link>
                <Link href="/register" className="btn-gold text-center py-2.5 text-sm">
                  Get Started Free
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
