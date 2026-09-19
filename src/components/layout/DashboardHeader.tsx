"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Search,
  ShoppingCart,
  Store,
  CheckCircle,
  Sparkles,
  ExternalLink,
  Menu,
  Sun,
  Moon,
  Globe,
} from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";

export function DashboardHeader({ title }: { title: string }) {
  const [selectedBranch, setSelectedBranch] = useState("main");
  const { toggle, isOpen } = useSidebar();
  const { isDark, toggleTheme } = useTheme();
  const { locale, toggleLocale, t } = useLanguage();

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          type="button"
          aria-label="Toggle side drawer"
          title={isOpen ? t("nav.hideSidebar") : t("nav.expandSidebar")}
          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors shrink-0 flex items-center justify-center cursor-pointer shadow-sm active:scale-95"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-sm sm:text-base md:text-lg font-bold text-white tracking-tight truncate max-w-[170px] sm:max-w-xs md:max-w-none">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Branch Switcher (hidden on mobile, visible on tablet/desktop) */}
        <div className="hidden md:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs">
          <Store className="w-3.5 h-3.5 text-indigo-400" />
          <select
            aria-label="Active Branch"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs"
          >
            <option value="main" className="bg-slate-900 text-white">
              {t("header.flagshipBranch")}
            </option>
            <option value="mirpur" className="bg-slate-900 text-white">
              {t("header.mirpurBranch")}
            </option>
            <option value="uttara" className="bg-slate-900 text-white">
              {t("header.uttaraBranch")}
            </option>
          </select>
        </div>

        {/* Quick POS Terminal Button */}
        <Link
          href="/dashboard/pos"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm shadow-emerald-600/30 transition-all shrink-0"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>{t("header.quickPos")}</span>
        </Link>

        {/* AI Advisor Badge */}
        <Link
          href="/dashboard/ai-advisor"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-purple-300 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 rounded-lg transition-colors shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>{t("header.aiForecast")}</span>
        </Link>

        {/* Language Switcher Button */}
        <button
          onClick={toggleLocale}
          type="button"
          aria-label={t("header.switchLanguage")}
          title={t("header.switchLanguage")}
          className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-all flex items-center gap-1 text-xs font-bold shrink-0 shadow-sm cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5 text-indigo-500" />
          <span>{locale === "bn" ? "EN" : "বাং"}</span>
        </button>

        {/* Theme Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          type="button"
          aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          title={isDark ? "Switch to Light Mode (লাইট মোড)" : "Switch to Dark Mode (ডার্ক মোড)"}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-all flex items-center justify-center shrink-0 shadow-sm"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600 transition-transform hover:-rotate-12" />
          )}
        </button>
      </div>
    </header>
  );
}
