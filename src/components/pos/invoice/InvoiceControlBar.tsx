"use client";

import React from "react";
import {
  Printer,
  X,
  Download,
  FileText,
  Receipt,
  SlidersHorizontal,
  Sparkles,
  Truck,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export interface InvoiceControlBarProps {
  printMode: "a4" | "compact" | "thermal" | "challan";
  setPrintMode: (mode: "a4" | "compact" | "thermal" | "challan") => void;
  isDemoData: boolean;
  setIsDemoData: (val: boolean | ((prev: boolean) => boolean)) => void;
  onExportCsv: () => void;
  onPrint: () => void;
  onClose: () => void;
}

/**
 * ইনভয়েস মডালের টপ কন্ট্রোল বার (Invoice Control Bar)
 * ফরম্যাট পরিবর্তন, ডেমো প্রিভিউ, CSV এক্সপোর্ট ও প্রিন্ট বাটন পরিচালনা করে।
 */
export function InvoiceControlBar({
  printMode,
  setPrintMode,
  isDemoData,
  setIsDemoData,
  onExportCsv,
  onPrint,
  onClose,
}: InvoiceControlBarProps) {
  const { txt } = useLanguage();

  return (
    <div className="bg-slate-950 px-4 sm:px-6 py-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 print:hidden shrink-0">
      {/* Format Toggle (4 Formats: Standard A4, Compact A4, 80mm POS, Delivery Challan) */}
      <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
        <button
          type="button"
          onClick={() => setPrintMode("a4")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            printMode === "a4"
              ? "bg-indigo-600 text-white shadow-sm font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{txt("স্ট্যান্ডার্ড A4", "Standard A4")}</span>
        </button>

        <button
          type="button"
          onClick={() => setPrintMode("compact")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            printMode === "compact"
              ? "bg-indigo-600 text-white shadow-sm font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>{txt("কম্প্যাক্ট A4", "Compact A4")}</span>
        </button>

        <button
          type="button"
          onClick={() => setPrintMode("thermal")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            printMode === "thermal"
              ? "bg-indigo-600 text-white shadow-sm font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>{txt("৮০মিমি পিওএস", "80mm POS")}</span>
        </button>

        <button
          type="button"
          onClick={() => setPrintMode("challan")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            printMode === "challan"
              ? "bg-emerald-600 text-white shadow-sm font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>{txt("ডেলিভারি চালান", "Challan / Waybill")}</span>
        </button>
      </div>

      {/* Action Buttons & Dummy Data Toggle */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsDemoData((prev) => !prev)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border cursor-pointer ${
            isDemoData
              ? "bg-amber-400 border-amber-300 text-black font-extrabold shadow-sm"
              : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
          }`}
          title={txt("ডামি ডাটা দিয়ে প্রিভিউ টেস্ট করুন", "Toggle dummy sample preview")}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>
            {isDemoData
              ? txt("ডেমো ডাটা অন", "Demo Preview ON")
              : txt("ডেমো প্রিভিউ", "Demo Preview")}
          </span>
        </button>

        <button
          type="button"
          onClick={onExportCsv}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          title={txt("CSV ফাইল ডাউনলোড করুন", "Download items as CSV")}
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">{txt("CSV এক্সপোর্ট", "Export CSV")}</span>
        </button>

        <button
          type="button"
          onClick={onPrint}
          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow flex items-center gap-2 transition-colors cursor-pointer"
          title={txt("প্রিন্ট দিন বা PDF সেভ করুন", "Print or save as PDF")}
        >
          <Printer className="w-4 h-4" />
          <span>{txt("প্রিন্ট / PDF সেভ", "Print / Save as PDF")}</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1 cursor-pointer"
          title={txt("বন্ধ করুন", "Close modal")}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
