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
} from "lucide-react";

export function DashboardHeader({ title }: { title: string }) {
  const [selectedBranch, setSelectedBranch] = useState("Main Flagship (Dhanmondi)");

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h1 className="text-lg font-bold text-white tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Branch Switcher */}
        <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs">
          <Store className="w-3.5 h-3.5 text-indigo-400" />
          <select
            aria-label="Active Branch"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs"
          >
            <option value="Main Flagship (Dhanmondi)" className="bg-slate-900 text-white">
              Main Flagship (Dhanmondi)
            </option>
            <option value="Mirpur Retail Outlet" className="bg-slate-900 text-white">
              Mirpur Retail Outlet
            </option>
            <option value="Uttara Sector 7 Hub" className="bg-slate-900 text-white">
              Uttara Sector 7 Hub
            </option>
          </select>
        </div>

        {/* Quick POS Terminal Button */}
        <Link
          href="/dashboard/pos"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm shadow-emerald-600/30 transition-all"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>Quick POS</span>
        </Link>

        {/* AI Advisor Badge */}
        <Link
          href="/dashboard/ai-advisor"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-purple-300 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 rounded-lg transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>AI Forecast</span>
        </Link>
      </div>
    </header>
  );
}
