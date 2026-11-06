"use client";

import React from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { ShimmerCard } from "@/components/ui/ShimmerSkeleton";
import { ShoppingCart, DollarSign, Wallet, TrendingUp, TrendingDown } from "lucide-react";

export interface OverviewFinancialCardsProps {
  loading: boolean;
  totalSales: number;
  totalInvoices: number;
  totalPaid: number;
  collectionRatio: number;
  totalDue: number;
  customerDue: number;
  netProfit: number;
  totalExpenses: number;
}

/**
 * ড্যাশবোর্ড প্রধান ফাইন্যান্সিয়াল কেপিআই কার্ডস (Financial Overview KPI Cards)
 * মোট বিক্রয় রেভিনিউ, নগদ ও ডিজিটাল আদায়, বকেয়া ব্যালেন্স এবং নিট লাভ/ক্ষতি প্রদর্শন করে।
 */
export function OverviewFinancialCards({
  loading,
  totalSales,
  totalInvoices,
  totalPaid,
  collectionRatio,
  totalDue,
  customerDue,
  netProfit,
  totalExpenses,
}: OverviewFinancialCardsProps) {
  const { txt } = useLanguage();

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ShimmerCard />
        <ShimmerCard />
        <ShimmerCard />
        <ShimmerCard />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* ১. মোট বিক্রয় রেভিনিউ */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">
            {txt("মোট বিক্রয় রেভিনিউ", "Total Sales Revenue")}
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <ShoppingCart className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-black text-white tracking-tight">
            {formatCurrency(totalSales)}
          </p>
          <div className="mt-1 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">{txt("মোট ইনভয়েস অর্ডার", "Invoices Created")}</span>
            <span className="font-bold text-emerald-400">
              {totalInvoices} {txt("টি অর্ডার", "Orders")}
            </span>
          </div>
        </div>
      </div>

      {/* ২. নগদ ও ডিজিটাল আদায় */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">
            {txt("নগদ ও ডিজিটাল আদায়", "Collected Cash & Digital")}
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-black text-white tracking-tight">
            {formatCurrency(totalPaid)}
          </p>
          <div className="mt-1 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">{txt("কালেকশন হার", "Collection Rate")}</span>
            <span className="font-bold text-indigo-400">
              {collectionRatio}% {txt("বিক্রয়ের", "of sales")}
            </span>
          </div>
        </div>
      </div>

      {/* ৩. সর্বমোট বকেয়া / বাকি */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">
            {txt("সর্বমোট বকেয়া / বাকি", "Total Market Due")}
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-black text-amber-400 tracking-tight">
            {formatCurrency(totalDue)}
          </p>
          <div className="mt-1 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">{txt("কাস্টমার বাকি", "Customer Due")}</span>
            <Link
              href="/dashboard/customers"
              className="font-bold text-amber-300 hover:underline"
            >
              {formatCurrency(customerDue)} &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* ৪. নিট লাভ বা নিট ক্ষতি */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">
            {netProfit > 0
              ? txt("প্রকৃত নিট লাভ (Net Profit)", "Net Profit")
              : netProfit < 0
              ? txt("প্রকৃত নিট ক্ষতি (Net Loss)", "Net Loss")
              : txt("ব্যালেন্সড (সমান)", "Net Balance")}
          </span>
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              netProfit > 0
                ? "bg-emerald-500/10 text-emerald-400"
                : netProfit < 0
                ? "bg-rose-500/10 text-rose-400"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            {netProfit >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <p
              className={`text-2xl font-black tracking-tight ${
                netProfit > 0
                  ? "text-emerald-400"
                  : netProfit < 0
                  ? "text-rose-400"
                  : "text-slate-200"
              }`}
            >
              {formatCurrency(Math.abs(netProfit))}
            </p>
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                netProfit > 0
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                  : netProfit < 0
                  ? "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                  : "bg-slate-800 text-slate-400 border border-slate-700"
              }`}
            >
              {netProfit > 0
                ? txt("লাভ", "Profit")
                : netProfit < 0
                ? txt("ঘাটতি", "Loss")
                : txt("সমান", "Balanced")}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">
              {netProfit < 0
                ? txt("খরচ বাদে ঘাটতি", "Loss after Expenses")
                : txt("দোকান খরচ", "Shop Expenses")}
            </span>
            <span className="font-semibold text-slate-300">
              {formatCurrency(totalExpenses)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
