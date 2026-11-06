"use client";

import React from "react";
import { Search, Upload, Download, Plus, RefreshCw } from "lucide-react";
import { Category } from "@/types";
import { useLanguage } from "@/context/LanguageContext";

export interface InventoryFilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCat: string;
  setSelectedCat: (cat: string) => void;
  categories: Category[];
  canExportExcel: boolean;
  loading: boolean;
  onOpenImportModal: () => void;
  onExportCsv: () => void;
  onOpenAddModal: () => void;
  onRefresh: () => void;
  onPageReset: () => void;
}

/**
 * ইনভেন্টরি ফিল্টার ও অ্যাকশন বার (Inventory Search & Action Bar)
 * সার্চ ইনপুট, ক্যাটাগরি ড্রপডাউন, CSV ইমপোর্ট/এক্সপোর্ট ও নতুন প্রোডাক্ট তৈরির বাটন প্রদান করে।
 */
export function InventoryFilterBar({
  searchQuery,
  setSearchQuery,
  selectedCat,
  setSelectedCat,
  categories,
  canExportExcel,
  loading,
  onOpenImportModal,
  onExportCsv,
  onOpenAddModal,
  onRefresh,
  onPageReset,
}: InventoryFilterBarProps) {
  const { txt } = useLanguage();

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-900/60 p-3 sm:p-4 rounded-2xl border border-slate-800">
      {/* বাম পাশ: সার্চ এবং ক্যাটাগরি ফিল্টার */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 max-w-xl">
        {/* সার্চ ইনপুট */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onPageReset();
            }}
            placeholder={txt(
              "নাম, SKU বা কোড দিয়ে পণ্য খুঁজুন...",
              "Search products by name, SKU or code..."
            )}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner"
          />
        </div>

        {/* ক্যাটাগরি ড্রপডাউন */}
        <select
          aria-label={txt("ক্যাটাগরি অনুযায়ী ফিল্টার", "Filter by Category")}
          value={selectedCat}
          onChange={(e) => {
            setSelectedCat(e.target.value);
            onPageReset();
          }}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none shrink-0"
        >
          <option value="ALL">{txt("সকল ক্যাটাগরি", "All Categories")}</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* ডান পাশ: অ্যাকশন বাটনসমূহ (Import, Export, New Product, Refresh) */}
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <button
          onClick={onOpenImportModal}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-slate-700 shadow-sm cursor-pointer"
          title={txt("বাল্ক CSV ফাইল ইমপোর্ট", "Bulk import items via CSV file")}
        >
          <Upload className="w-3.5 h-3.5 text-amber-400" />
          <span>{txt("CSV ইমপোর্ট", "Import CSV")}</span>
        </button>

        {canExportExcel && (
          <button
            onClick={onExportCsv}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            title={txt("ক্যাটালগ CSV ফাইলে এক্সপোর্ট", "Export catalog to CSV")}
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>{txt("CSV এক্সপোর্ট", "Export CSV")}</span>
          </button>
        )}

        <button
          onClick={onOpenAddModal}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{txt("নতুন প্রোডাক্ট", "New Product")}</span>
        </button>

        <button
          onClick={onRefresh}
          className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
          title={txt("পণ্য তালিকা রিফ্রেশ করুন", "Refresh product list")}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-400" : ""}`} />
        </button>
      </div>
    </div>
  );
}
