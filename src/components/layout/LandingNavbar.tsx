"use client";

import Link from "next/link";
import { useState } from "react";
import { Boxes, Menu, X, ArrowRight, Smartphone, Sun, Moon, Globe } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";

export function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { locale, toggleLocale, t } = useLanguage();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-600/30">
            <Boxes className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white block">
              {t("common.appName")}
            </span>
          </div>
          <span className="hidden sm:inline-flex text-[11px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-medium ml-1">
            {locale === "bn" ? "ক্লাউড পিওএস" : "Cloud POS"}
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link href="/#features" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
            {locale === "bn" ? "ফিচারসমূহ" : "Features"}
          </Link>
          <Link href="/#pos" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
            {t("nav.pos")}
          </Link>
          <Link href="/#ledger" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
            {locale === "bn" ? "বাকি খাতা" : "Due Ledgers"}
          </Link>
          <Link href="/pricing" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
            {locale === "bn" ? "প্যাকেজ ও মূল্য" : "Pricing"}
          </Link>
          <a
            href="https://play.google.com/store/apps/details?id=com.earbaj.inventarioya&pcampaignid=web_share"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium"
          >
            <Smartphone className="w-4 h-4" />
            <span>{locale === "bn" ? "প্লে-স্টোর অ্যাপ" : "Play Store App"}</span>
          </a>
        </nav>

        {/* CTA Buttons & Switchers */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Language Switcher */}
          <button
            onClick={toggleLocale}
            type="button"
            aria-label="Toggle language"
            title={locale === "bn" ? "Switch to English" : "বাংলায় পরিবর্তন করুন"}
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-sm"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{locale === "bn" ? "English" : "বাংলা"}</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            type="button"
            aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all flex items-center justify-center cursor-pointer shadow-sm"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          <Link
            href="/login"
            className="px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            {t("common.signIn")}
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5"
          >
            {t("common.freeTrial")}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-1.5">
          <button
            onClick={toggleLocale}
            type="button"
            className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
          >
            {locale === "bn" ? "EN" : "বাং"}
          </button>
          <button
            onClick={toggleTheme}
            type="button"
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle navigation"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-5 space-y-3">
          <Link href="/#features" onClick={() => setIsOpen(false)} className="block text-slate-700 dark:text-slate-300 py-1.5 text-sm font-medium">
            {locale === "bn" ? "ফিচারসমূহ" : "Features"}
          </Link>
          <Link href="/#pos" onClick={() => setIsOpen(false)} className="block text-slate-700 dark:text-slate-300 py-1.5 text-sm font-medium">
            {t("nav.pos")}
          </Link>
          <Link href="/#ledger" onClick={() => setIsOpen(false)} className="block text-slate-700 dark:text-slate-300 py-1.5 text-sm font-medium">
            {locale === "bn" ? "বাকি খাতা" : "Due Ledgers"}
          </Link>
          <Link href="/pricing" onClick={() => setIsOpen(false)} className="block text-slate-700 dark:text-slate-300 py-1.5 text-sm font-medium">
            {locale === "bn" ? "প্যাকেজ ও মূল্য" : "Pricing"}
          </Link>
          <a
            href="https://play.google.com/store/apps/details?id=com.earbaj.inventarioya&pcampaignid=web_share"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 py-1.5 text-sm font-medium"
          >
            <Smartphone className="w-4 h-4" />
            {locale === "bn" ? "প্লে-স্টোর অ্যাপ ডাউনলোড" : "Download Play Store App"}
          </a>
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            <Link href="/login" onClick={() => setIsOpen(false)} className="w-full text-center py-2.5 rounded-xl text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 text-sm font-medium">
              {t("common.signIn")}
            </Link>
            <Link href="/register" onClick={() => setIsOpen(false)} className="w-full text-center py-2.5 rounded-xl text-white bg-indigo-600 text-sm font-semibold">
              {t("common.freeTrial")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
