"use client";

import React from "react";
import { Invoice } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { ShimmerTableRows } from "@/components/ui/ShimmerSkeleton";
import {
  FileText,
  SlidersHorizontal,
  Receipt,
  RotateCcw,
  CheckCircle2,
  MoreVertical,
  Truck,
} from "lucide-react";

export interface SalesInvoiceTableProps {
  invoices: Invoice[];
  loading: boolean;
  activeMenuId: string | null;
  setActiveMenuId: (id: string | null) => void;
  onOpenInvoice: (inv: Invoice, mode: "a4" | "compact" | "thermal" | "challan") => void;
  canProcessReturn: boolean;
  onOpenReturnModal: (inv: Invoice) => void;
}

/**
 * বিক্রয় ইনভয়েস তালিকা টেবিল (Sales Invoice Directory Table)
 * ইনভয়েস নম্বর, কাস্টমার, ক্যাশিয়ার, গ্র্যান্ড টোটাল, পেইড, বকেয়া এবং অ্যাকশন মেনু প্রদর্শন করে।
 */
export function SalesInvoiceTable({
  invoices,
  loading,
  activeMenuId,
  setActiveMenuId,
  onOpenInvoice,
  canProcessReturn,
  onOpenReturnModal,
}: SalesInvoiceTableProps) {
  const { txt } = useLanguage();

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
      <div className="overflow-x-auto min-h-[320px]">
        <table className="w-full min-w-[800px] text-left text-xs">
          <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">{txt("ইনভয়েস #", "Invoice #")}</th>
              <th className="py-3.5 px-4">{txt("তারিখ ও সময়", "Date & Time")}</th>
              <th className="py-3.5 px-4">{txt("কাস্টমার", "Customer")}</th>
              <th className="py-3.5 px-4">{txt("ক্যাশিয়ার", "Served By")}</th>
              <th className="py-3.5 px-4 text-right">{txt("মোট মূল্য", "Total Amount")}</th>
              <th className="py-3.5 px-4 text-right">{txt("পরিশোধ", "Paid")}</th>
              <th className="py-3.5 px-4 text-right">{txt("বাকি", "Due")}</th>
              <th className="py-3.5 px-4 text-center">{txt("স্ট্যাটাস", "Status")}</th>
              <th className="py-3.5 px-4 text-right">{txt("অ্যাকশন / প্রিন্ট", "Action / Print")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <ShimmerTableRows rows={8} cols={9} />
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-500">
                  {txt(
                    "বর্তমান সার্চ বা ফিল্টারে কোনো ইনভয়েস পাওয়া যায়নি।",
                    "No invoices found matching current search or filters."
                  )}
                </td>
              </tr>
            ) : (
              invoices.map((inv, idx) => {
                const isDue = Number(inv.dueAmount || 0) > 0;
                const status = inv.status?.toUpperCase() || (isDue ? "DUE" : "PAID");
                const invKey = inv.id || inv.invoiceNumber || String(idx);

                return (
                  <tr
                    key={invKey}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* ইনভয়েস নম্বর ও রিটার্ন স্ট্যাটাস */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => onOpenInvoice(inv, "a4")}
                        className="font-mono font-bold text-indigo-400 hover:text-indigo-300 hover:underline text-left block"
                        title={txt("A4 ইনভয়েস দেখুন / প্রিন্ট করুন", "View / Print A4 Invoice")}
                      >
                        {inv.invoiceNumber || inv.invoiceNo}
                      </button>
                      {inv.isReturned === "partially_returned" ? (
                        <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          {txt("আংশিক ফেরত", "Partial Ret.")}
                          {Number(inv.totalRefunded) > 0 ? ` (-৳${inv.totalRefunded})` : ""}
                        </span>
                      ) : inv.isReturned === "fully_returned" ? (
                        <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          {txt("সম্পূর্ণ ফেরত", "Fully Returned")}
                        </span>
                      ) : inv.isReturned && inv.isReturned !== "none" ? (
                        <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400">
                          {txt("ফেরতকৃত", "Returned")}
                        </span>
                      ) : null}
                    </td>

                    {/* তারিখ */}
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {formatDate(inv.createdAt || inv.date)}
                    </td>

                    {/* ক্রেতা */}
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-white">{inv.customerName}</p>
                      {inv.customerPhone ? (
                        <p className="text-[10px] text-slate-400 font-mono">
                          {inv.customerPhone}
                        </p>
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">
                          {txt("সাধারণ ক্রেতা", "Walk-in")}
                        </span>
                      )}
                    </td>

                    {/* ক্যাশিয়ার / ব্রাঞ্চ */}
                    <td className="py-3.5 px-4 text-slate-300">
                      <p className="font-medium text-slate-200">{inv.cashierName}</p>
                      {inv.branchName && (
                        <p className="text-[10px] text-indigo-400 font-semibold">
                          {inv.branchName}
                        </p>
                      )}
                    </td>

                    {/* গ্র্যান্ড টোটাল */}
                    <td className="py-3.5 px-4 text-right font-black text-white font-mono">
                      {formatCurrency(inv.grandTotal)}
                    </td>

                    {/* পেইড */}
                    <td className="py-3.5 px-4 text-right text-emerald-400 font-bold font-mono">
                      {formatCurrency(inv.paidAmount)}
                    </td>

                    {/* বকেয়া */}
                    <td className="py-3.5 px-4 text-right font-mono">
                      {isDue ? (
                        <span className="text-rose-400 font-bold">
                          {formatCurrency(inv.dueAmount)}
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>

                    {/* স্ট্যাটাস ব্যাজ */}
                    <td className="py-3.5 px-4 text-center">
                      {inv.isReturned === "fully_returned" ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-block bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          {txt("ফেরত সম্পন্ন", "RETURNED")}
                        </span>
                      ) : inv.isReturned === "partially_returned" ? (
                        <div className="flex flex-col items-center gap-0.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider inline-block ${
                              status === "PAID"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : status === "PARTIAL"
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            }`}
                          >
                            {status === "PAID" ? txt("পরিশোধিত", "PAID") : status === "PARTIAL" ? txt("আংশিক", "PARTIAL") : txt("বাকি", "DUE")}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-amber-500/10 text-amber-300">
                            {txt("আংশিক ফেরত", "Partial Ret.")}
                          </span>
                        </div>
                      ) : (
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-block ${
                            status === "PAID"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : status === "PARTIAL"
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : status === "REFUNDED"
                              ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                              : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          }`}
                        >
                          {status === "PAID" ? txt("পরিশোধিত", "PAID") : status === "PARTIAL" ? txt("আংশিক", "PARTIAL") : status === "REFUNDED" ? txt("রিফান্ড", "REFUNDED") : txt("বাকি", "DUE")}
                        </span>
                      )}
                    </td>

                    {/* অ্যাকশন মেনু (A4, Compact, Thermal, Return) */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="relative inline-block text-left action-menu-container">
                        <button
                          type="button"
                          onClick={() => setActiveMenuId(activeMenuId === invKey ? null : invKey)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                          title={txt("প্রিন্ট ও ইনভয়েস অপশন", "Print & Invoice Options")}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeMenuId === invKey && (
                          <div className="absolute right-0 top-full mt-1 w-56 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl z-50 py-1 overflow-hidden backdrop-blur-md text-left divide-y divide-slate-800/80">
                            <div className="py-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onOpenInvoice(inv, "a4");
                                }}
                                className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-200 hover:bg-indigo-600/20 hover:text-indigo-300 flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                                <span>{txt("স্ট্যান্ডার্ড ইনভয়েস (A4)", "Standard A4 Invoice")}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onOpenInvoice(inv, "compact");
                                }}
                                className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-200 hover:bg-blue-600/20 hover:text-blue-300 flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
                                <span>{txt("কম্প্যাক্ট ইনভয়েস (A4)", "Compact A4 Invoice")}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onOpenInvoice(inv, "thermal");
                                }}
                                className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-200 hover:bg-emerald-600/20 hover:text-emerald-300 flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                                <span>{txt("থার্মাল স্লিপ প্রিন্ট (POS)", "Print POS Thermal Slip")}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onOpenInvoice(inv, "challan");
                                }}
                                className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-200 hover:bg-emerald-600/20 hover:text-emerald-300 flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <Truck className="w-3.5 h-3.5 text-emerald-400" />
                                <span>{txt("ডেলিভারি চালান / ওয়েবিল", "Delivery Challan / Waybill")}</span>
                              </button>
                            </div>

                            {canProcessReturn && (
                              <div className="py-1">
                                {inv.isReturned === "fully_returned" ? (
                                  <div className="px-3 py-1.5 text-[11px] text-slate-500 italic flex items-center gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                                    <span>{txt("সম্পূর্ণ ফেরত সম্পন্ন", "Fully Returned")}</span>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      onOpenReturnModal(inv);
                                    }}
                                    className="w-full px-3 py-2 text-left text-xs font-semibold text-amber-300 hover:bg-amber-600/20 flex items-center gap-2.5 transition-colors cursor-pointer"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                                    <span>{txt("পণ্য ফেরত / রিটার্ন নিন", "Process Sales Return")}</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
