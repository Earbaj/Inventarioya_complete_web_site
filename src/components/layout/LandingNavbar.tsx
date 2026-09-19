"use client";

import Link from "next/link";
import { useState } from "react";
import { Boxes, Menu, X, ArrowRight, Smartphone, Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-600/30">
            <Boxes className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white block">
              Inventarioya
            </span>
          </div>
          <span className="hidden sm:inline-flex text-[11px] px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-medium ml-1">
            Smart Cloud POS
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <Link href="/#features" className="hover:text-white transition-colors">ফিচারসমূহ</Link>
          <Link href="/#pos" className="hover:text-white transition-colors">পয়েন্ট অফ সেল</Link>
          <Link href="/#ledger" className="hover:text-white transition-colors">বাকি খাতা</Link>
          <Link href="/pricing" className="hover:text-white transition-colors">প্যাকেজ ও মূল্য</Link>
          <a
            href="https://play.google.com/store/apps/details?id=com.earbaj.inventarioya&pcampaignid=web_share"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-emerald-300 transition-colors flex items-center gap-1.5 text-emerald-400 font-medium"
          >
            <Smartphone className="w-4 h-4" />
            <span>প্লে-স্টোর অ্যাপ</span>
          </a>
        </nav>

        {/* CTA Buttons & Theme Toggle */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            type="button"
            aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center justify-center"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400" />
            )}
          </button>

          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            লগইন
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5"
          >
            ফ্রি শুরু করুন
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            type="button"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Toggle navigation"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-5 space-y-3">
          <Link href="/#features" onClick={() => setIsOpen(false)} className="block text-slate-300 py-1.5 text-sm">ফিচারসমূহ</Link>
          <Link href="/#pos" onClick={() => setIsOpen(false)} className="block text-slate-300 py-1.5 text-sm">পয়েন্ট অফ সেল</Link>
          <Link href="/#ledger" onClick={() => setIsOpen(false)} className="block text-slate-300 py-1.5 text-sm">বাকি খাতা</Link>
          <Link href="/pricing" onClick={() => setIsOpen(false)} className="block text-slate-300 py-1.5 text-sm">প্যাকেজ ও মূল্য</Link>
          <a
            href="https://play.google.com/store/apps/details?id=com.earbaj.inventarioya&pcampaignid=web_share"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-1 text-emerald-400 py-1.5 text-sm"
          >
            <Smartphone className="w-4 h-4" />
            প্লে-স্টোর অ্যাপ ডাউনলোড
          </a>
          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            <Link href="/login" onClick={() => setIsOpen(false)} className="w-full text-center py-2.5 rounded-xl text-slate-200 bg-slate-800 text-sm font-medium">লগইন করুন</Link>
            <Link href="/register" onClick={() => setIsOpen(false)} className="w-full text-center py-2.5 rounded-xl text-white bg-indigo-600 text-sm font-semibold">ফ্রি শুরু করুন</Link>
          </div>
        </div>
      )}
    </header>
  );
}
