"use client";

import React from "react";
import { Search, X, Store, ChevronDown, Printer, Download, RefreshCw } from "lucide-react";
import { Branch } from "@/types";
import { useLanguage } from "@/context/LanguageContext";

export interface SalesFilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  branchFilter: string;
  setBranchFilter: (branchId: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  dateFilter: string;
  setDateFilter: (date: string) => void;
  branches: Branch[];
  canExportExcel: boolean;
  loading: boolean;
  onPrintReport: () => void;
  onExportCsv: () => void;
  onRefresh: () => void;
  onPageReset: () => void;
}

/**
 * বিক্রয় ফিল্টার বার (Sales Filter & Action Bar)
 * ইনভয়েস সার্চ, ব্রাঞ্চ ফিল্টারিং, স্ট্যাটাস ফিল্টারিং, ডেট রেঞ্জ এবং এক্সপোর্ট অ্যাকশনসমূহ পরিচালনা করে।
 */
export function SalesFilterBar({
  searchQuery,
  setSearchQuery,
  branchFilter,
  setBranchFilter,
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
  branches,
  canExportExcel,
  loading,
  onPrintReport,
  onExportCsv,
  onRefresh,
  onPageReset,
}: SalesFilterBarProps) {
  const { txt } = useLanguage();

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
      {/* বাম পাশের ফিল্টারসমূহ (Search, Branch, Status, Date) */}
      <div className="flex flex-wrap items-center gap-2 flex-1">
        {/* সার্চ ইনপুট */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onPageReset();
            }}
            placeholder={txt(
              "ইনভয়েস #, ক্রেতার নাম বা ফোন...",
              "Search invoice #, customer name, phone..."
            )}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                onPageReset();
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* ব্রাঞ্চ ফিল্টার */}
        {branches.length > 0 && (
          <div className="relative">
            <select
              value={branchFilter}
              onChange={(e) => {
                setBranchFilter(e.target.value);
                onPageReset();
              }}
              className="appearance-none bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl pl-8 pr-9 py-2 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">{txt("সকল ব্রাঞ্চ", "All Branches")}</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <Store
              size={13}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        )}

        {/* স্ট্যাটাস ফিল্টার */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              onPageReset();
            }}
            className="appearance-none bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl pl-3 pr-9 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">{txt("সকল স্ট্যাটাস", "All Status")}</option>
            <option value="PAID">{txt("পরিশোধিত", "Paid")}</option>
            <option value="DUE">{txt("বাকি", "Due")}</option>
            <option value="PARTIAL">{txt("আংশিক", "Partial")}</option>
            <option value="RETURNED">{txt("ফেরতকৃত", "Returned")}</option>
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>

        {/* ডেট রেঞ্জ ফিল্টার */}
        <div className="relative">
          <select
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              onPageReset();
            }}
            className="appearance-none bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl pl-3 pr-9 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">{txt("সকল তারিখ", "All Dates")}</option>
            <option value="TODAY">{txt("আজকের বিক্রয়", "Today")}</option>
            <option value="LAST_7_DAYS">{txt("গত ৭ দিন", "Last 7 Days")}</option>
            <option value="LAST_30_DAYS">{txt("গত ৩০ দিন", "Last 30 Days")}</option>
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>
      </div>

      {/* ডান পাশের অ্যাকশন বাটনসমূহ (Print, CSV, Refresh) */}
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <button
          onClick={onPrintReport}
          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
          title={txt("বিক্রয় সারসংক্ষেপ রিপোর্ট প্রিন্ট বা PDF ডাউনলোড করুন", "Print executive sales summary report or save as PDF")}
        >
          <Printer className="w-4 h-4" />
          <span>{txt("রিপোর্ট প্রিন্ট / PDF", "Print / PDF Report")}</span>
        </button>

        {canExportExcel && (
          <button
            onClick={onExportCsv}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
            title={txt("ফিল্টারকৃত বিক্রয় তালিকা CSV ডাউনলোড", "Export filtered sales to CSV")}
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>{txt("CSV এক্সপোর্ট", "Export CSV")}</span>
          </button>
        )}

        <button
          onClick={onRefresh}
          className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
          title={txt("বিক্রয় ডাটা রিফ্রেশ করুন", "Refresh sales data")}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-400" : ""}`} />
        </button>
      </div>
    </div>
  );
}
