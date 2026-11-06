"use client";

import React from "react";
import Link from "next/link";
import { Package, AlertTriangle, Users, ReceiptText } from "lucide-react";
import { ShimmerItem } from "@/components/ui/ShimmerSkeleton";
import { useLanguage } from "@/context/LanguageContext";

export interface OverviewOperationPillsProps {
  loading: boolean;
  totalItems: number;
  lowStock: number;
  totalCustomers: number;
  totalInvoices: number;
}

/**
 * অপারেশনাল শর্টকাট পিলস (Operational Shortcuts & Inventory Urgencies)
 * পণ্য সংখ্যা, লো-স্টক সতর্কতা, কাস্টমার এবং ইনভয়েস কাউন্ট লিংক হিসেবে প্রদর্শন করে।
 */
export function OverviewOperationPills({
  loading,
  totalItems,
  lowStock,
  totalCustomers,
  totalInvoices,
}: OverviewOperationPillsProps) {
  const { txt } = useLanguage();

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <ShimmerItem height="68px" rounded="rounded-xl" />
        <ShimmerItem height="68px" rounded="rounded-xl" />
        <ShimmerItem height="68px" rounded="rounded-xl" />
        <ShimmerItem height="68px" rounded="rounded-xl" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {/* ১. ক্যাটালগ প্রোডাক্টস */}
      <Link
        href="/dashboard/inventory"
        className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <p className="text-lg font-bold text-white group-hover:text-sky-400 transition-colors">
              {totalItems}
            </p>
            <p className="text-[11px] text-slate-400">
              {txt("মোট পণ্য ক্যাটালগ", "Catalog Products")}
            </p>
          </div>
        </div>
      </Link>

      {/* ২. লো-স্টক সতর্কতা */}
      <Link
        href="/dashboard/inventory"
        className={`p-4 rounded-xl border transition-all group ${
          lowStock > 0
            ? "bg-rose-500/5 border-rose-500/30 hover:border-rose-500/50"
            : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-lg font-bold text-rose-400">{lowStock}</p>
            <p className="text-[11px] text-slate-400">
              {txt("লো-স্টক সতর্কতা", "Low Stock Alert")}
            </p>
          </div>
        </div>
      </Link>

      {/* ৩. সক্রিয় কাস্টমার */}
      <Link
        href="/dashboard/customers"
        className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <p className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
              {totalCustomers}
            </p>
            <p className="text-[11px] text-slate-400">
              {txt("সক্রিয় কাস্টমার", "Active Customers")}
            </p>
          </div>
        </div>
      </Link>

      {/* ৪. সেলস ইনভয়েস */}
      <Link
        href="/dashboard/sales"
        className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <ReceiptText className="w-4 h-4" />
          </div>
          <div>
            <p className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
              {totalInvoices}
            </p>
            <p className="text-[11px] text-slate-400">
              {txt("সেলস ইনভয়েস", "Sales Invoices")}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}
