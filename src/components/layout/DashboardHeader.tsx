"use client";

import { useState, useEffect } from "react";
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
  RefreshCw,
} from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { BranchesService } from "@/lib/api/client";
import { Branch } from "@/types";

export function DashboardHeader({ title }: { title: string }) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [loadingBranches, setLoadingBranches] = useState<boolean>(true);
  const { toggle, isOpen } = useSidebar();
  const { isDark, toggleTheme } = useTheme();
  const { locale, toggleLocale, t } = useLanguage();

  useEffect(() => {
    let isMounted = true;
    async function loadBranches() {
      try {
        const data = await BranchesService.getBranches();
        if (isMounted) {
          let list = Array.isArray(data) ? [...data] : [];

          // Ensure default main flagship branch is always present in list
          const hasMain = list.some((b) => b.isMainBranch || b.id === "br_001" || b.id === "main");
          if (!hasMain) {
            const defaultMain: Branch = {
              id: "br_001",
              name: t("header.flagshipBranch") || "Main Flagship Branch",
              address: "Road 27, Dhanmondi, Dhaka",
              phone: "+880 2-9112233",
              isMainBranch: true,
            };
            list = [defaultMain, ...list];
          }

          setBranches(list);

          // Retrieve saved branch from localStorage or default to main / first branch
          const savedBranch = typeof window !== "undefined" ? localStorage.getItem("selected_branch_id") : null;
          if (savedBranch && list.some((b) => b.id === savedBranch)) {
            setSelectedBranch(savedBranch);
          } else if (list.length > 0) {
            const main = list.find((b) => b.isMainBranch) || list[0];
            setSelectedBranch(main.id);
            if (typeof window !== "undefined") {
              localStorage.setItem("selected_branch_id", main.id);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load branches in header:", err);
      } finally {
        if (isMounted) setLoadingBranches(false);
      }
    }

    loadBranches();

    // Listen for custom branch creation or branch updates across the app
    const handleBranchCreated = (e: any) => {
      loadBranches();
      if (e?.detail?.branchId) {
        setSelectedBranch(e.detail.branchId);
        if (typeof window !== "undefined") {
          localStorage.setItem("selected_branch_id", e.detail.branchId);
        }
      }
    };

    window.addEventListener("branchCreated", handleBranchCreated);
    window.addEventListener("branchesUpdated", loadBranches);

    return () => {
      isMounted = false;
      window.removeEventListener("branchCreated", handleBranchCreated);
      window.removeEventListener("branchesUpdated", loadBranches);
    };
  }, []);

  const handleBranchChange = (branchId: string) => {
    setSelectedBranch(branchId);
    if (typeof window !== "undefined") {
      localStorage.setItem("selected_branch_id", branchId);
      // Dispatch custom event so any other components listening can react
      window.dispatchEvent(new CustomEvent("branchChanged", { detail: { branchId } }));
    }
  };

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
        {/* Dynamic Branch Switcher (hidden on mobile, visible on tablet/desktop) */}
        <div className="hidden md:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs">
          <Store className="w-3.5 h-3.5 text-indigo-400" />
          {loadingBranches ? (
            <span className="text-slate-400 text-xs flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin text-indigo-400" />
              <span>Loading...</span>
            </span>
          ) : branches.length === 0 ? (
            <span className="text-slate-400 text-xs">
              {t("header.flagshipBranch") || "Main Store"}
            </span>
          ) : (
            <select
              aria-label="Active Branch"
              value={selectedBranch}
              onChange={(e) => handleBranchChange(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs max-w-[170px] truncate"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                  {b.name} {b.isMainBranch ? "★" : ""}
                </option>
              ))}
            </select>
          )}
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
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 rounded-lg transition-colors shrink-0"
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
