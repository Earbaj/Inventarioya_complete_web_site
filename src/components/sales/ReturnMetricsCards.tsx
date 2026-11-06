"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { RotateCcw, DollarSign, PackageMinus, TrendingUp } from "lucide-react";

export interface ReturnMetricsCardsProps {
  totalReturnsCount: number;
  totalRefundAmount: number;
  totalRestockedQty: number;
  dueAdjustedAmount: number;
}

/**
 * রিটার্ন কেপিআই মেট্রিক্স কার্ডস (Return Summary KPI Cards)
 * মোট রিটার্ন সংখ্যা, সর্বমোট রিফান্ড, স্টকে পুনঃসংযোজিত আইটেম ও বকেয়া সমন্বয় প্রদর্শন করে।
 */
export function ReturnMetricsCards({
  totalReturnsCount,
  totalRefundAmount,
  totalRestockedQty,
  dueAdjustedAmount,
}: ReturnMetricsCardsProps) {
  const { txt } = useLanguage();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* মোট রিটার্ন সংখ্যা */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {txt("মোট রিটার্ন সংখ্যা", "Total Returns")}
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <RotateCcw className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-black text-white mt-2 font-mono">{totalReturnsCount}</p>
        <p className="text-[10px] text-slate-500 mt-1">
          {txt("পণ্য ফেরত ট্রানজেকশন", "Return transactions")}
        </p>
      </div>

      {/* মোট রিফান্ডকৃত অর্থ */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {txt("মোট রিফান্ডকৃত অর্থ", "Total Refunded")}
          </span>
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-black text-rose-400 mt-2 font-mono">
          {formatCurrency(totalRefundAmount)}
        </p>
        <p className="text-[10px] text-slate-500 mt-1">
          {txt("ক্যাশ ও বকেয়া সমন্বয়", "Cash & due adjusted")}
        </p>
      </div>

      {/* ফেরতকৃত মোট আইটেম */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {txt("ফেরতকৃত মোট আইটেম", "Items Restocked")}
          </span>
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <PackageMinus className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-black text-purple-400 mt-2 font-mono">
          {totalRestockedQty}
        </p>
        <p className="text-[10px] text-slate-500 mt-1">
          {txt("স্টকে পুনঃসংযোজিত সংখ্যা", "Quantity returned to stock")}
        </p>
      </div>

      {/* বকেয়া সমন্বয় */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {txt("বকেয়া সমন্বয়", "Due Adjusted")}
          </span>
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-black text-indigo-400 mt-2 font-mono">
          {formatCurrency(dueAdjustedAmount)}
        </p>
        <p className="text-[10px] text-slate-500 mt-1">
          {txt("কাস্টমার লেজার অ্যাডজাস্ট", "Customer ledger adjusted")}
        </p>
      </div>
    </div>
  );
}
