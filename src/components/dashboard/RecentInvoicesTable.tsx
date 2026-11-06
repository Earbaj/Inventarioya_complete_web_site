"use client";

import React from "react";
import Link from "next/link";
import { Invoice } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { ShimmerTableRows } from "@/components/ui/ShimmerSkeleton";
import { Printer } from "lucide-react";

export interface RecentInvoicesTableProps {
  loading: boolean;
  recentSales: Invoice[];
  onSelectInvoice: (inv: Invoice) => void;
}

/**
 * সাম্প্রতিক পিওএস ইনভয়েস টেবিল (Recent POS Invoices Table)
 * সর্বশেষ বিক্রয় ট্রানজেকশন, কাস্টমার, টাকার পরিমাণ ও থার্মাল রসিদ প্রিন্ট করার সুবিধা দেয়।
 */
export function RecentInvoicesTable({
  loading,
  recentSales,
  onSelectInvoice,
}: RecentInvoicesTableProps) {
  const { txt } = useLanguage();

  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800">
      {/* হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-bold text-white">
            {txt("সাম্প্রতিক পিওএস ইনভয়েস", "Recent POS Invoices")}
          </h3>
          <p className="text-xs text-slate-400">
            {txt(
              `দোকানের সর্বশেষ লেনদেনসমূহ (${recentSales.length} টি দেখানো হচ্ছে)`,
              `Latest transactions from this store register (${recentSales.length} showing)`
            )}
          </p>
        </div>
        <Link
          href="/dashboard/sales"
          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
        >
          {txt("সকল ইনভয়েস দেখুন", "View All Invoices")} &rarr;
        </Link>
      </div>

      {/* টেবিল */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-xs">
          <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold">
            <tr>
              <th className="py-3 px-4">{txt("ইনভয়েস #", "Invoice #")}</th>
              <th className="py-3 px-4">{txt("কাস্টমার", "Customer")}</th>
              <th className="py-3 px-4">{txt("সময়", "Time")}</th>
              <th className="py-3 px-4">{txt("আইটেম", "Items")}</th>
              <th className="py-3 px-4">{txt("টাকা", "Amount")}</th>
              <th className="py-3 px-4">{txt("পেমেন্ট মাধ্যম", "Payment")}</th>
              <th className="py-3 px-4">{txt("স্ট্যাটাস", "Status")}</th>
              <th className="py-3 px-4 text-right">{txt("রসিদ প্রিন্ট", "Receipt")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <ShimmerTableRows rows={5} cols={8} />
            ) : recentSales.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  {txt("এখনও কোনো ইনভয়েস তৈরি হয়নি।", "No invoices found yet.")}
                </td>
              </tr>
            ) : (
              recentSales.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-indigo-400">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3 px-4 font-medium text-white">{inv.customerName}</td>
                  <td className="py-3 px-4 text-slate-400">{formatDate(inv.createdAt)}</td>
                  <td className="py-3 px-4 text-slate-300">
                    {inv.items?.length || 1} {txt("টি", "items")}
                  </td>
                  <td className="py-3 px-4 font-bold text-white">
                    {formatCurrency(inv.grandTotal)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                      {inv.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inv.status === "PAID"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-rose-500/20 text-rose-400"
                      }`}
                    >
                      {inv.status === "PAID"
                        ? txt("পরিশোধিত", "PAID")
                        : inv.status === "PARTIAL"
                        ? txt("আংশিক", "PARTIAL")
                        : txt("বকেয়া", "DUE")}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onSelectInvoice(inv)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer"
                      title={txt("থার্মাল রসিদ প্রিন্ট করুন", "Print Thermal Receipt")}
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
