"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export interface SalesPaginationProps {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

/**
 * বিক্রয় পেজিনেশন কম্পোনেন্ট (Sales Pagination Bar)
 * প্রতি পৃষ্ঠায় প্রদর্শিত সংখ্যা এবং পরবর্তী / পূর্ববর্তী পৃষ্ঠা নেভিগেশন নিয়ন্ত্রণ করে।
 */
export function SalesPagination({
  currentPage,
  pageSize,
  totalPages,
  totalRecords,
  onPageChange,
  onPageSizeChange,
}: SalesPaginationProps) {
  const { txt } = useLanguage();

  const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  return (
    <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
      {/* বাম পাশ: রেকর্ড সংখ্যা এবং পেজ সাইজ ড্রপডাউন */}
      <div className="flex items-center gap-2">
        <span>
          {txt(
            `দেখাচ্ছে ${startRecord} থেকে ${endRecord} (মোট ${totalRecords} টি বিক্রয়)`,
            `Showing ${startRecord} to ${endRecord} of ${totalRecords} sales`
          )}
        </span>
        <div className="h-3 w-px bg-slate-800 mx-2" />
        <select
          aria-label={txt("প্রতি পৃষ্ঠার রেকর্ড সংখ্যা", "Rows per page")}
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
        >
          <option value={10}>10 {txt("টি প্রতি পৃষ্ঠায়", "per page")}</option>
          <option value={25}>25 {txt("টি প্রতি পৃষ্ঠায়", "per page")}</option>
          <option value={50}>50 {txt("টি প্রতি পৃষ্ঠায়", "per page")}</option>
        </select>
      </div>

      {/* ডান পাশ: পূর্ববর্তী ও পরবর্তী পৃষ্ঠা বাটন */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title={txt("পূর্ববর্তী পৃষ্ঠা", "Previous Page")}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="px-3 py-1 font-semibold text-white">
          {txt(`পৃষ্ঠা ${currentPage} / ${totalPages}`, `Page ${currentPage} of ${totalPages}`)}
        </span>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title={txt("পরবর্তী পৃষ্ঠা", "Next Page")}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
