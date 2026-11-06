"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils";
import { ShoppingBag, TrendingUp, CheckCircle2, AlertCircle } from "lucide-react";
import { ShimmerCard } from "@/components/ui/ShimmerSkeleton";
import { useLanguage } from "@/context/LanguageContext";

export interface SalesMetricsCardsProps {
  loading: boolean;
  totalInvoicesCount: number;
  totalSalesRevenue: number;
  totalPaidAmount: number;
  totalDueAmount: number;
}

/**
 * সেলস ও রেভিনিউ কেপিআই কার্ডস (Sales KPI Financial Overview Cards)
 * মোট ইনভয়েস, সর্বমোট রেভিনিউ, আদায়কৃত নগদ এবং বকেয়া প্রদর্শন করে।
 */
export function SalesMetricsCards({
  loading,
  totalInvoicesCount,
  totalSalesRevenue,
  totalPaidAmount,
  totalDueAmount,
}: SalesMetricsCardsProps) {
  const { txt } = useLanguage();

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <ShimmerCard />
        <ShimmerCard />
        <ShimmerCard />
        <ShimmerCard />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Total Invoices */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {txt("মোট ইনভয়েস", "Total Invoices")}
          </span>
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-black text-white mt-2 font-mono">
          {totalInvoicesCount}
        </p>
        <p className="text-[10px] text-slate-500 mt-1">
          {txt("রেকর্ডকৃত বিক্রয় অর্ডার", "Recorded sales orders")}
        </p>
      </div>

      {/* 2. Total Revenue */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {txt("মোট রেভিনিউ / বিক্রয়", "Total Revenue")}
          </span>
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-black text-white mt-2 font-mono">
          {formatCurrency(totalSalesRevenue)}
        </p>
        <p className="text-[10px] text-slate-500 mt-1">
          {txt("সর্বমোট বিক্রয়কৃত পরিমাণ", "Cumulative billed volume")}
        </p>
      </div>

      {/* 3. Paid / Collected */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
            {txt("পরিশোধিত / আদায়কৃত", "Paid / Collected")}
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-black text-emerald-400 mt-2 font-mono">
          {formatCurrency(totalPaidAmount)}
        </p>
        <p className="text-[10px] text-slate-500 mt-1">
          {txt("নগদ ও ডিজিটাল আদায়", "Cash & digital collections")}
        </p>
      </div>

      {/* 4. Outstanding Due */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">
            {txt("মোট বাকি (বকেয়া)", "Outstanding Due (Due)")}
          </span>
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-black text-rose-400 mt-2 font-mono">
          {formatCurrency(totalDueAmount)}
        </p>
        <p className="text-[10px] text-slate-500 mt-1">
          {txt("কাস্টমারদের কাছে বাকি", "Pending customer balances")}
        </p>
      </div>
    </div>
  );
}
