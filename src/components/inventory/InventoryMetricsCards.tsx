"use client";

import React from "react";
import { Package, Layers, AlertTriangle, CheckCircle2 } from "lucide-react";
import { ShimmerCard } from "@/components/ui/ShimmerSkeleton";
import { useLanguage } from "@/context/LanguageContext";

export interface InventoryMetricsCardsProps {
  loading: boolean;
  totalProductsCount: number;
  totalStockUnits: number;
  lowStockCount: number;
  activeCategoriesCount: number;
}

/**
 * ইনভেন্টরি কেপিআই কার্ডস (Inventory Overview KPI Cards)
 * মোট প্রোডাক্ট, মজুত স্টক ইউনিট, লো-স্টক সতর্কতা ও সক্রিয় ক্যাটাগরি প্রদর্শন করে।
 */
export function InventoryMetricsCards({
  loading,
  totalProductsCount,
  totalStockUnits,
  lowStockCount,
  activeCategoriesCount,
}: InventoryMetricsCardsProps) {
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
      {/* ১. মোট প্রোডাক্ট */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {txt("মোট প্রোডাক্ট", "Total Products")}
          </span>
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Package className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-black text-white mt-2 font-mono">{totalProductsCount}</p>
        <p className="text-[10px] text-slate-500 mt-1">
          {txt("ক্যাটালগ পণ্য আইটেম", "Unique catalog items")}
        </p>
      </div>

      {/* ২. মোট স্টক ইউনিট */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {txt("মোট স্টক ইউনিট", "Total Stock Units")}
          </span>
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-black text-white mt-2 font-mono">{totalStockUnits}</p>
        <p className="text-[10px] text-slate-500 mt-1">
          {txt("মজুদ থাকা মোট ইউনিট", "On-hand physical units")}
        </p>
      </div>

      {/* ৩. কম স্টক সতর্কবার্তা */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">
            {txt("কম স্টক সতর্কবার্তা", "Low Stock Warning")}
          </span>
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-black text-rose-400 mt-2 font-mono">{lowStockCount}</p>
        <p className="text-[10px] text-slate-500 mt-1">
          {txt("দ্রুত রি-অর্ডার করা প্রয়োজন", "Needs reordering soon")}
        </p>
      </div>

      {/* ৪. সক্রিয় ক্যাটাগরি */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
            {txt("সক্রিয় ক্যাটাগরি", "Active Categories")}
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-black text-emerald-400 mt-2 font-mono">
          {activeCategoriesCount || 3}
        </p>
        <p className="text-[10px] text-slate-500 mt-1">
          {txt("পণ্য শ্রেণি বিভাগ", "Classification groups")}
        </p>
      </div>
    </div>
  );
}
